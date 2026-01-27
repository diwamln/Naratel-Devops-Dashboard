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
        
        // Load Config for Pool
        let domainPool = [];
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            domainPool = config.testDomains || [];
        }

        if (domainPool.length > 0) {
            // Check if app already has a test domain assigned
            if (appEntry.testDomain && domainPool.includes(appEntry.testDomain)) {
                selectedDomain = appEntry.testDomain;
                console.log(`[Domain] Reusing assigned domain for ${appName}: ${selectedDomain}`);
            } else {
                // Find used domains
                const usedDomains = registry
                    .map(r => r.testDomain)
                    .filter(d => d); // Filter nulls
                
                // Find first available
                selectedDomain = domainPool.find(d => !usedDomains.includes(d));
                
                if (!selectedDomain) {
                    return NextResponse.json({ 
                        error: "No testing domains available. Please destroy an existing test environment to free up a slot." 
                    }, { status: 503 });
                }
                
                // Assign to app entry (in memory, save later)
                registry[appIndex].testDomain = selectedDomain;
                console.log(`[Domain] Allocated new domain for ${appName}: ${selectedDomain}`);
            }
        } else {
            console.warn("[Domain] No testDomains defined in config.json. Falling back to NodePort/Default.");
        }
        // -------------------------------

        const generatedFolders = [];

        // --- HELPER: Deploy Component (App or DB) ---
        const deployComponent = (role, suffixProd, suffixTest) => {
            const isDb = role === 'db';
            const dbPrefix = isDb ? 'db-' : '';
            
            let prodFolder = path.join(repoPath, 'apps', `${appId}-${dbPrefix}${appName}${suffixProd}`);
            let testFolder = path.join(repoPath, 'apps', `${appId}-${dbPrefix}${appName}${suffixTest}`);
            
            if (!fs.existsSync(prodFolder)) {
                // Legacy Fallback (without ID prefix)
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

            // A. Copy Secrets (Encrypted)
            const prodSecret = path.join(prodFolder, 'secrets.yaml');
            if (fs.existsSync(prodSecret)) {
                fs.copyFileSync(prodSecret, path.join(testFolder, 'secrets.yaml'));
            }

            // B. Read & Modify Values
            const prodValuesPath = path.join(prodFolder, 'values.yaml');
            if (fs.existsSync(prodValuesPath)) {
                const prodValContent = fs.readFileSync(prodValuesPath, 'utf8');
                let values = yaml.load(prodValContent);

                const isDbComp = role === 'db';

                // --- SPECIAL LOGIC FOR DB: Use Lightweight Testing Chart ---
                if (isDbComp) {
                    // Extract existing DB info from prod values to maintain version consistency
                    const dbType = values.databaseType || 'mariadb';
                    const dbRepo = values[dbType]?.image?.repository || (dbType === 'postgres' ? 'devopsnaratel/postgresql' : 'devopsnaratel/mariadb');
                    const dbTag = values[dbType]?.image?.tag || (dbType === 'postgres' ? '18.1' : '12.1.2');
                    const storageClass = values.storage?.className || 'longhorn';

                    // Reconstruct values entirely for db-testing-chart
                    values = {
                        namespace: `${appId}-db-${appName}-testing`,
                        fullnameOverride: `sts-db-${appName}-${appId}`,
                        databaseType: dbType,
                        storage: {
                            className: storageClass,
                            size: "2Gi" // Fixed small size for ephemeral testing
                        },
                        imagePullSecrets: [
                            { name: "dockerhub-auth" }
                        ],
                        serviceAccount: {
                            create: true,
                            name: `sa-db-${appName}-test`
                        },
                        podAnnotations: {
                            "app.kubernetes.io/id": appId,
                            "app.kubernetes.io/env": "testing"
                        }
                    };

                    // Add DB Specific Image Config
                    if (dbType === 'mariadb') {
                        values.mariadb = { image: { repository: dbRepo, tag: dbTag } };
                    } else {
                        values.postgres = { image: { repository: dbRepo, tag: dbTag } };
                    }

                } else {
                    // --- APP LOGIC: Clone & Modify ---
                    values.namespace = `${appId}-${appName}-testing`; 
                    values.app.env = 'testing';
                    
                    // Override Image Tag if provided (Only for App)
                    if (imageTag) {
                        values.image.tag = imageTag;
                    }

                    // --- INGRESS LOGIC ---
                    if (selectedDomain) {
                        // Use Allocated Domain
                        values.ingress = {
                            enabled: true,
                            className: "nginx", // Default to nginx or keep prod class
                            hosts: [
                                {
                                    host: selectedDomain,
                                    path: "/"
                                }
                            ]
                        };
                        // Note: We deliberately do not enable TLS for ephemeral testing to avoid CertManager limits/complexity, 
                        // or we could add a wildcard secret if available. For now, http only.
                    } else {
                        // Fallback to NodePort logic or "test-" prefix if pool empty (shouldn't happen with check above)
                        if (values.ingress && values.ingress.enabled && values.ingress.hosts) {
                            values.ingress.hosts = values.ingress.hosts.map(h => ({
                                ...h,
                                host: `test-${h.host}`
                            }));
                        }
                    }
                    
                    // Override Migration Command for Testing (Auto-Seed)
                    if (values.migration && values.migration.enabled) {
                        values.migration.command = "php artisan migrate --seed --force";
                    }
                    
                    // DB Connection for APP
                    if (dbType !== 'none') {
                        const dbFqdn = `svc-db-${appName}-${appId}.${appId}-db-${appName}-testing.svc.cluster.local`;
                        if (!values.extraEnv) values.extraEnv = [];
                        values.extraEnv = values.extraEnv.filter(e => e.name !== 'DB_HOST');
                        values.extraEnv.push({
                            name: "DB_HOST",
                            value: dbFqdn
                        });
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