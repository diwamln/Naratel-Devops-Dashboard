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
        } else {
            console.warn("[Domain] No testDomains defined in config.json. Falling back to NodePort/Default.");
        }

        const generatedFolders = [];

        // --- HELPER: Deploy Component (App or DB) ---
        const deployComponent = (role, suffixProd, suffixTest) => {
            const isDb = role === 'db';
            const dbPrefix = isDb ? 'db-' : '';
            
            let prodFolder = path.join(repoPath, 'apps', `${appId}-${dbPrefix}${appName}${suffixProd}`);
            let testFolder = path.join(repoPath, 'apps', `${appId}-${dbPrefix}${appName}${suffixTest}`);
            
            if (!fs.existsSync(prodFolder)) {
                // Legacy Fallback
                const legacyProdFolder = path.join(repoPath, 'apps', `${dbPrefix}${appName}${suffixProd}`);
                if (fs.existsSync(legacyProdFolder)) {
                    prodFolder = legacyProdFolder;
                    testFolder = path.join(repoPath, 'apps', `${dbPrefix}${appName}${suffixTest}`);
                } else {
                    console.warn(`Prod folder not found: ${prodFolder}`);
                    return;
                }
            }

            if (!fs.existsSync(testFolder)) {
                fs.mkdirSync(testFolder, { recursive: true });
            }

            // A. Handle Secrets (Prefer Standby, Fallback to Copy)
            const testSecretPath = path.join(testFolder, 'secrets.yaml');
            const prodSecretPath = path.join(prodFolder, 'secrets.yaml');
            
            if (fs.existsSync(testSecretPath)) {
                console.log(`[Secrets] Using existing/standby secrets for ${appName}${suffixTest}`);
            } else if (fs.existsSync(prodSecretPath)) {
                console.warn(`[Secrets] Standby secret not found. Copying Prod secret for ${appName}${suffixTest}`);
                fs.copyFileSync(prodSecretPath, testSecretPath);
            }

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
                    // --- APP LOGIC: Clone & Modify with Security Overrides ---
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
                    } else {
                        if (values.ingress && values.ingress.enabled && values.ingress.hosts) {
                            values.ingress.hosts = values.ingress.hosts.map(h => ({
                                ...h,
                                host: `test-${h.host}`
                            }));
                        }
                    }
                    
                    // Migration
                    if (values.migration && values.migration.enabled) {
                        values.migration.command = "php artisan migrate --seed --force";
                    }
                    
                    // DB Connection: AGGRESSIVE OVERWRITE
                    if (dbType !== 'none') {
                        const dbFqdn = `svc-db-${appName}-${appId}.${appId}-db-${appName}-testing.svc.cluster.local`;
                        const dbPort = dbType === 'postgres' ? "5432" : "3306";
                        const realDbUser = dbType === 'postgres' ? "postgres" : "root"; 
                        // Note: For 'postgres' chart, default pass might be needed if not set.
                        // Ideally we should use a known testing password or one generated in the DB deployment.
                        // Assuming 'changeme_securely' is the default for our testing charts or handled by secrets.
                        
                        if (!values.extraEnv) values.extraEnv = [];
                        
                        const overrides = [
                            // Standard
                            { name: "DB_HOST", value: dbFqdn },
                            { name: "DB_PORT", value: dbPort },
                            { name: "DB_USER", value: realDbUser },
                            { name: "DB_USERNAME", value: realDbUser },
                            { name: "DB_PASSWORD", value: "changeme_securely" },
                            { name: "DB_PASS", value: "changeme_securely" },
                            { name: "DB_NAME", value: `${appName.replace(/-/g, '_')}_testing` },
                            { name: "DB_DATABASE", value: `${appName.replace(/-/g, '_')}_testing` },

                            // Postgres Specific
                            { name: "POSTGRES_HOST", value: dbFqdn },
                            { name: "PGHOST", value: dbFqdn },
                            { name: "POSTGRES_USER", value: realDbUser },
                            { name: "POSTGRES_PASSWORD", value: "changeme_securely" },
                            { name: "POSTGRES_DB", value: `${appName.replace(/-/g, '_')}_testing` },

                            // MySQL/MariaDB Specific
                            { name: "MYSQL_HOST", value: dbFqdn },
                            { name: "MARIADB_HOST", value: dbFqdn },
                            { name: "MYSQL_USER", value: realDbUser },
                            { name: "MYSQL_PASSWORD", value: "changeme_securely" },
                            { name: "MYSQL_DATABASE", value: `${appName.replace(/-/g, '_')}_testing` },
                            
                            // Dangerous Connection Strings (POISONING)
                            { name: "DATABASE_URL", value: `${dbType}://${realDbUser}:changeme_securely@${dbFqdn}:${dbPort}/${appName.replace(/-/g, '_')}_testing` },
                            { name: "DB_URL", value: `${dbType}://${realDbUser}:changeme_securely@${dbFqdn}:${dbPort}/${appName.replace(/-/g, '_')}_testing` }
                        ];

                        const overrideNames = overrides.map(o => o.name);
                        values.extraEnv = values.extraEnv.filter(e => !overrideNames.includes(e.name));
                        values.extraEnv.push(...overrides);
                    }
                }

                // Write Values
                fs.writeFileSync(path.join(testFolder, 'values.yaml'), yaml.dump(values));
                generatedFolders.push(`${appName}${suffixTest}`);
            }
        };

        // 3. Deploy App
        deployComponent('app', '-prod', '-testing');

        // 4. Deploy DB (if exists)
        if (dbType !== 'none') {
            deployComponent('db', '-prod', '-testing');
        }

        if (generatedFolders.length === 0) {
             return NextResponse.json({ error: "No prod manifests found to clone." }, { status: 400 });
        }

        // 5. Save Registry (Update assigned domain)
        fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

        // 6. Commit & Push
        execSync(`git add .`, { cwd: repoPath });
        const commitMsg = `feat: deploy ephemeral testing for ${appName} using ${selectedDomain || 'NodePort'}`;
        
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
            message: "Ephemeral environment deployed", 
            folders: generatedFolders,
            testDomain: selectedDomain,
            namespaceApp: `${appId}-${appName}-testing`,
            namespaceDb: dbType !== 'none' ? `${appId}-${appName}-db-testing` : null
        });

    });

  } catch (err) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
