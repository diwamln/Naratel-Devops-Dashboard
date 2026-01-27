import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml'; 
import { gitMutex } from '@/lib/gitMutex';

export async function POST(req) {
  try {
    const data = await req.json();
    const { appName, imageTag } = data;

    if (!appName) {
        return NextResponse.json({ error: "appName is required" }, { status: 400 });
    }

    const repoDirName = 'manifest-repo-workdir';
    const repoPath = path.join(os.tmpdir(), repoDirName);
    const registryPath = path.join(repoPath, 'registry.json');
    const configPath = path.join(repoPath, 'config.json');
    
    const token = process.env.GITHUB_TOKEN;
    const repoUrl = process.env.MANIFEST_REPO_URL;
    const userName = process.env.GIT_USER_NAME || "Naratel DevOps Dashboard";
    const userEmail = process.env.GIT_USER_EMAIL || "devops@naratel.com";

    if (!repoUrl || !token) {
        return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    return await gitMutex.runExclusive(async () => {
        // 1. Git Setup
        const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);
        if (!fs.existsSync(repoPath)) {
            execSync(`git clone ${authenticatedUrl} ${repoPath}`);
            execSync(`git config user.name "${userName}"`, { cwd: repoPath });
            execSync(`git config user.email "${userEmail}"`, { cwd: repoPath });
        } else {
            execSync(`git fetch origin`, { cwd: repoPath });
            execSync(`git reset --hard origin/main`, { cwd: repoPath });
        }

        // 2. Get App ID from Registry & Check Domain Availability
        let registry = [];
        if (fs.existsSync(registryPath)) {
            registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        }
        
        const appIndex = registry.findIndex(r => r.name === appName);
        if (appIndex === -1) {
            return NextResponse.json({ error: `App ${appName} not found in registry` }, { status: 404 });
        }
        
        const appEntry = registry[appIndex];
        const appId = appEntry.id;
        const dbType = appEntry.db; 

        // --- DOMAIN ALLOCATION LOGIC ---
        let selectedDomain = null;
        let domainPool = [];
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            domainPool = config.testDomains || [];
        }

        if (domainPool.length > 0) {
            if (appEntry.testDomain && domainPool.includes(appEntry.testDomain)) {
                selectedDomain = appEntry.testDomain;
            } else {
                const usedDomains = registry.map(r => r.testDomain).filter(d => d);
                selectedDomain = domainPool.find(d => !usedDomains.includes(d));
                
                if (!selectedDomain) {
                    return NextResponse.json({ 
                        error: "No testing domains available. Please destroy an existing test environment to free up a slot." 
                    }, { status: 503 });
                }
                registry[appIndex].testDomain = selectedDomain;
            }
        }

        const generatedFolders = [];

        // --- HELPER: Deploy Component (App or DB) ---
        const deployComponent = (role, suffixProd, suffixTest) => {
            const isDb = role === 'db';
            const dbPrefix = isDb ? 'db-' : '';
            
            let prodFolder = path.join(repoPath, 'apps', `${appId}-${dbPrefix}${appName}${suffixProd}`);
            let testFolder = path.join(repoPath, 'apps', `${appId}-${dbPrefix}${appName}${suffixTest}`);
            
            // Note: Folder testing mungkin sudah ada jika standby secret sudah di-generate
            if (!fs.existsSync(testFolder)) {
                fs.mkdirSync(testFolder, { recursive: true });
            }

            // A. Handle Secrets (ABSOLUTE REQUIREMENT)
            const testSecretPath = path.join(testFolder, 'secrets.yaml');
            
            if (!fs.existsSync(testSecretPath)) {
                throw new Error(`Standby secret for ${role} (${appName}${suffixTest}) not found in repository. Please configure testing secrets first.`);
            }
            
            console.log(`[Secrets] Using verified standby secrets for ${appName}${suffixTest}`);

            // B. Read & Modify Values
            const prodValuesPath = path.join(prodFolder, 'values.yaml');
            if (fs.existsSync(prodValuesPath)) {
                const prodValContent = fs.readFileSync(prodValuesPath, 'utf8');
                let values = yaml.load(prodValContent);

                const isDbComp = role === 'db';

                if (isDbComp) {
                    // --- DB LOGIC: Use Lightweight Testing Chart ---
                    const dbType = values.databaseType || 'mariadb';
                    const dbRepo = values[dbType]?.image?.repository || (dbType === 'postgres' ? 'devopsnaratel/postgresql' : 'devopsnaratel/mariadb');
                    const dbTag = values[dbType]?.image?.tag || (dbType === 'postgres' ? '18.1' : '12.1.2');
                    const storageClass = values.storage?.className || 'longhorn';

                    values = {
                        namespace: `${appId}-db-${appName}-testing`,
                        fullnameOverride: `sts-db-${appName}-${appId}`,
                        databaseType: dbType,
                        storage: { className: storageClass, size: "2Gi" },
                        imagePullSecrets: [{ name: "dockerhub-auth" }],
                        serviceAccount: { create: true, name: `sa-db-${appName}-test` },
                        podAnnotations: {
                            "app.kubernetes.io/id": appId,
                            "app.kubernetes.io/env": "testing"
                        }
                    };

                    if (dbType === 'mariadb') {
                        values.mariadb = { image: { repository: dbRepo, tag: dbTag } };
                    } else {
                        values.postgres = { image: { repository: dbRepo, tag: dbTag } };
                    }

                } else {
                    // --- APP LOGIC: Simple Clone & Metadata Update ---
                    values.namespace = `${appId}-${appName}-testing`; 
                    values.app.env = 'testing';
                    
                    if (imageTag) values.image.tag = imageTag;

                    // Ingress
                    if (selectedDomain) {
                        values.ingress = {
                            enabled: true,
                            className: "nginx",
                            hosts: [{ host: selectedDomain, path: "/" }]
                        };
                    } else if (values.ingress && values.ingress.enabled && values.ingress.hosts) {
                        values.ingress.hosts = values.ingress.hosts.map(h => ({
                            ...h,
                            host: `test-${h.host}`
                        }));
                    }
                    
                    // Migration
                    // We use the same command as Prod (cloned from values), unless we want to force seed.
                    // User requested to match WebUI input exactly.
                    // if (values.migration && values.migration.enabled) {
                    //    values.migration.command = "php artisan migrate --seed --force";
                    // }
                    
                    // NO AGGRESSIVE OVERWRITE HERE
                    // System expects that the Standby Secret ALREADY contains correct DB_HOST etc.
                }

                // Write Values
                fs.writeFileSync(path.join(testFolder, 'values.yaml'), yaml.dump(values));
                generatedFolders.push(`${appName}${suffixTest}`);
            }
        };

        try {
            // 3. Deploy App (Throws if no secret)
            deployComponent('app', '-prod', '-testing');

            // 4. Deploy DB (Throws if no secret)
            if (dbType !== 'none') {
                deployComponent('db', '-prod', '-testing');
            }

            if (generatedFolders.length === 0) {
                 return NextResponse.json({ error: "No manifests generated." }, { status: 400 });
            }

            // 5. Save Registry (Update assigned domain)
            fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

            // 6. Commit & Push
            execSync(`git add .`, { cwd: repoPath });
            const commitMsg = `feat: deploy ephemeral testing for ${appName} using standby secrets`;
            
            try {
                 execSync(`git commit -m "${commitMsg}"`, { cwd: repoPath });
                 execSync(`git push origin main`, { cwd: repoPath });
            } catch (e) {
                 if (e.message.includes('nothing to commit')) {
                     return NextResponse.json({ message: "Environment already up-to-date." });
                 }
                 throw e;
            }

            return NextResponse.json({ 
                message: "Ephemeral environment deployed successfully using standby secrets", 
                folders: generatedFolders,
                testDomain: selectedDomain,
                namespaceApp: `${appId}-${appName}-testing`,
                namespaceDb: dbType !== 'none' ? `${appId}-db-${appName}-testing` : null
            });

        } catch (err) {
            // If deployComponent throws, it lands here
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

    });

  } catch (err) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 500 });
  }
}