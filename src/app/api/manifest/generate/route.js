import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { gitMutex } from '@/lib/gitMutex';
import { createPipelineJob } from '@/lib/jenkins';

export async function POST(req) {
    const data = await req.json();

    const repoDirName = 'manifest-repo-workdir';
    const repoPath = path.join(os.tmpdir(), repoDirName);
    const registryPath = path.join(repoPath, 'registry.json');

    const token = process.env.GITHUB_TOKEN;
    const repoUrl = process.env.MANIFEST_REPO_URL;
    const userName = process.env.GIT_USER_NAME || "Naratel DevOps Dashboard";
    const userEmail = process.env.GIT_USER_EMAIL || "devops@naratel.com";
    const ageKey = "age1ywhtcmyuhmfa32kfaaxcak4dvq27q9g6m55gqlzu2vlwkgfj24wq3g4ejx"; // Public Key

    if (!repoUrl || !token) {
        return NextResponse.json({ error: "Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing." }, { status: 500 });
    }

    return await gitMutex.runExclusive(async () => {
        try {
            // --- 0. Git Setup (Clone/Pull) ---
            const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);

            if (!fs.existsSync(repoPath)) {
                console.log(`Cloning repository to ${repoPath}...`);
                execSync(`git clone ${authenticatedUrl} ${repoPath}`);
                execSync(`git config user.name "${userName}"`, { cwd: repoPath });
                execSync(`git config user.email "${userEmail}"`, { cwd: repoPath });
            } else {
                console.log(`Updating repository at ${repoPath}...`);
                try {
                    execSync(`git fetch origin`, { cwd: repoPath });
                    execSync(`git reset --hard origin/main`, { cwd: repoPath });
                } catch (e) {
                    console.warn("Git pull/reset failed, attempting to re-clone...", e.message);
                    fs.rmSync(repoPath, { recursive: true, force: true });
                    execSync(`git clone ${authenticatedUrl} ${repoPath}`);
                    execSync(`git config user.name "${userName}"`, { cwd: repoPath });
                    execSync(`git config user.email "${userEmail}"`, { cwd: repoPath });
                }
            }
        } catch (error) {
            console.error("Git Setup Failed:", error.message);
            return NextResponse.json({ error: "Failed to initialize git repository: " + error.message }, { status: 500 });
        }

        // --- Race Condition Check ---
        try {
            if (fs.existsSync(registryPath)) {
                const content = fs.readFileSync(registryPath, 'utf8');
                const currentRegistry = JSON.parse(content);

                const isTaken = currentRegistry.some(app => app.id === data.appId);

                if (isTaken) {
                    let maxId = 0;
                    currentRegistry.forEach(app => {
                        const idNum = parseInt(app.id);
                        if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
                    });
                    data.appId = String(maxId + 1).padStart(3, '0');
                }
                
                // Domain Logic (Optional for Prod creation, usually for Test)
                // We leave domain allocation for deploy-test route mostly.
            }
        } catch (e) {
            console.warn("Failed to validate App ID collision:", e.message);
        }

        const generatedFolders = [];
        const errors = [];

        let safeImageRepo = data.imageRepo;
        if (safeImageRepo && safeImageRepo.startsWith('dockerio/')) {
            safeImageRepo = safeImageRepo.replace('dockerio/', '');
        }

        // --- Helper: Parse Secrets ---
        const parseSecrets = (list) => {
            const obj = {};
            if (Array.isArray(list)) {
                list.forEach(s => {
                    if (s.key && s.value !== undefined) obj[s.key] = s.value;
                });
            }
            return obj;
        };

        // Prepare Secret Objects
        const appSecretsProd = parseSecrets(data.appSecrets);
        // Note: Frontend should send appSecretsTest if it wants to pre-provision test secrets
        const appSecretsTest = parseSecrets(data.appSecretsTest || []); 

        const dbSecretsProd = parseSecrets(data.dbSecrets);
        const dbSecretsTest = parseSecrets(data.dbSecretsTest || []);

        // --- DB Key Standardization ---
        const standardizeDbSecrets = (secretObj, type, appName, env) => {
            const dbName = appName.replace(/-/g, '_') + (env === 'testing' ? '_testing' : '');
            
            if (type === 'postgres') {
                Object.keys(secretObj).forEach(k => {
                    if (k.startsWith('MYSQL_') || k.startsWith('MARIADB_')) delete secretObj[k];
                });
                
                secretObj["POSTGRESQL_DATABASE"] = secretObj["POSTGRESQL_DATABASE"] || secretObj["POSTGRES_DB"] || secretObj["DB_NAME"] || dbName;
                secretObj["POSTGRESQL_USERNAME"] = secretObj["POSTGRESQL_USERNAME"] || secretObj["POSTGRES_USER"] || secretObj["DB_USER"] || "postgres";
                secretObj["POSTGRESQL_PASSWORD"] = secretObj["POSTGRESQL_PASSWORD"] || secretObj["POSTGRES_PASSWORD"] || secretObj["DB_PASS"] || "changeme_securely";
                secretObj["POSTGRESQL_POSTGRES_PASSWORD"] = secretObj["POSTGRESQL_PASSWORD"];

                delete secretObj["POSTGRES_DB"]; delete secretObj["POSTGRES_USER"]; delete secretObj["POSTGRES_PASSWORD"];
                delete secretObj["DB_NAME"]; delete secretObj["DB_USER"]; delete secretObj["DB_PASS"];
            } else {
                Object.keys(secretObj).forEach(k => {
                    if (k.startsWith('POSTGRES_') || k.startsWith('POSTGRESQL_')) delete secretObj[k];
                });

                secretObj["MARIADB_DATABASE"] = secretObj["MARIADB_DATABASE"] || secretObj["MYSQL_DATABASE"] || secretObj["DB_NAME"] || dbName;
                secretObj["MARIADB_USER"] = secretObj["MARIADB_USER"] || secretObj["MYSQL_USER"] || secretObj["DB_USER"] || "app_user";
                secretObj["MARIADB_PASSWORD"] = secretObj["MARIADB_PASSWORD"] || secretObj["MYSQL_PASSWORD"] || secretObj["DB_PASS"] || "changeme_securely";
                secretObj["MARIADB_ROOT_PASSWORD"] = secretObj["MARIADB_ROOT_PASSWORD"] || secretObj["MYSQL_ROOT_PASSWORD"] || "changeme_root";

                delete secretObj["MYSQL_DATABASE"]; delete secretObj["MYSQL_USER"]; delete secretObj["MYSQL_PASSWORD"];
                delete secretObj["MYSQL_ROOT_PASSWORD"]; delete secretObj["DB_NAME"]; delete secretObj["DB_USER"]; delete secretObj["DB_PASS"];
            }
            return secretObj;
        };

        if (data.dbType !== 'none') {
            standardizeDbSecrets(dbSecretsProd, data.dbType, data.appName, 'prod');
            if (Object.keys(dbSecretsTest).length > 0) {
                standardizeDbSecrets(dbSecretsTest, data.dbType, data.appName, 'testing');
            }
        }

        // --- Helper: Format Secrets to YAML ---
        const formatSecrets = (obj) => {
            if (Object.keys(obj).length === 0) return '{}';
            return Object.entries(obj)
                .map(([k, v]) => {
                    const safeVal = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                    return `  ${k}: "${safeVal}"`;
                })
                .join('\n');
        };

        // --- Generator Logic ---
        const generateYaml = (templateType, env, secretsObj) => {
            const appName = data.appName;
            const appId = data.appId;
            let values = "";
            let secrets = `secretData:\n${formatSecrets(secretsObj)}`;

            // Inject DB Connection for App
            if (templateType.startsWith('app') && data.dbType !== 'none') {
                const dbPort = data.dbType === 'postgres' ? "5432" : "3306";
                // Prod: svc-db-APP-ID.ID-db-APP-prod...
                // Test: svc-db-APP-ID.ID-db-APP-testing...
                const nsSuffix = env === 'prod' ? 'prod' : 'testing';
                
                // Note: We don't inject into secretsObj here because secretsObj is passed in.
                // But we should ensure the app knows where to connect.
                // Usually this is done via secrets or env vars. 
                // Since this is initial generation, users usually put connection details in the secrets form.
                // We can Auto-Inject them into the secretsObj if they are missing?
                // For simplicity, we assume user/frontend populated the secrets OR we rely on standard vars.
                
                // Actually, let's inject DB_HOST into values.extraEnv if not present, to be safe.
                // But wait, secrets are preferred.
            }

            if (templateType === 'app-prod') {
                values = `
namespace: "${appId}-${appName}-prod"
controllerType: Deployment
app:
  id: "${appId}"
  name: "${appName}"
  env: "prod"
image:
  repository: "${safeImageRepo}"
  tag: "${data.imageTag}"
imagePullSecrets:
  - name: "dockerhub-auth"
service:
  port: ${data.servicePort}
  targetPort: ${data.targetPort}
`.trim();
                if (data.migrationEnabled) {
                    const checkImage = data.dbType === 'postgres' ? 'devopsnaratel/postgresql:18.1' : 'devopsnaratel/mariadb:12.1.2';
                    values += `
migration:
  enabled: true
  command: "${data.migrationCommand}"
  checkImage: "${checkImage}"`;
                }
                if (data.dbType !== 'none') {
                    values += `
backup:
  enabled: true
  type: "${data.dbType}"`;
                }
                if (data.ingressEnabled) {
                    values += `
ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: "${data.ingressHost}"
      path: /
`;
                    if (data.tlsEnabled) {
                        values += `  tls:
    - secretName: "${appName}-tls"
      hosts:
        - "${data.ingressHost}"`;
                    }
                }
            }

            if (templateType === 'db-prod') {
                const dbType = data.dbType;
                const dbImage = dbType === 'postgres' ? 'devopsnaratel/postgresql' : 'devopsnaratel/mariadb';
                const dbTag = dbType === 'postgres' ? '18.1' : '12.1.2';
                
                let dbSpecificConfig = '';
                if (dbType === 'mariadb') {
                    dbSpecificConfig = `
mariadb:
  image:
    repository: "${dbImage}"
    tag: "${dbTag}"
  backup:
    schedule: "0 1 * * *"
  restore:
    enabled: "false"
    s3Path: ""
    sourceNamespace: ""`;
                } else {
                    dbSpecificConfig = `
postgres:
  image:
    repository: "${dbImage}"
    tag: "${dbTag}"
  backup:
    schedule: "0 1 * * *"
  restore:
    enabled: "false"
    s3Path: ""
    sourceNamespace: ""`;
                }
                
                values = `
# Generated by Naratel Dashboard - Enterprise Database Manifest
namespace: "${appId}-db-${appName}-prod"
fullnameOverride: "sts-db-${appName}-${appId}"
databaseType: "${dbType}"

s3:
  endpoint: "http://10.246.2.154:8010"
  bucket: "${dbType === 'postgres' ? 'postgres-wal-archive' : 'mariadb-wal-archive'}"
  region: "us-east-1"

storage:
  className: "${data.storageClass || 'longhorn'}"
  size: "10Gi"

imagePullSecrets:
  - name: "dockerhub-auth"

serviceAccount:
  create: true
  name: "sa-db-${appName}"

${dbSpecificConfig.trim()}

podAnnotations:
  app.kubernetes.io/id: "${appId}"
  app.kubernetes.io/env: "prod"
  backup.naratel.com/enabled: "true"
`.trim();
            }

            return { values, secrets };
        };

        // --- Helper: Write & Encrypt ---
        const processManifest = (folderName, type, env, secretObj) => {
            const targetFolder = path.join(repoPath, 'apps', folderName);
            const valuesPath = path.join(targetFolder, 'values.yaml');
            const secretsPath = path.join(targetFolder, 'secrets.yaml');

            if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });

            const { values, secrets } = generateYaml(type, env, secretObj);

            // Write Values
            fs.writeFileSync(valuesPath, values);

            // Write Secrets
            fs.writeFileSync(secretsPath, secrets);

            // Encrypt Secrets
            try {
                execSync(`sops --encrypt --age ${ageKey} --encrypted-regex '^(secretData)$' --in-place ${secretsPath}`, { cwd: repoPath });
                generatedFolders.push(folderName);
            } catch (e) {
                console.error(`Encryption failed for ${folderName}`, e);
                errors.push(`Encryption failed for ${folderName}: ${e.message}`);
            }
        };

        // --- Helper: Generate Secret File ONLY (For Testing Standby) ---
        const generateSecretFile = (folderName, secretObj) => {
            const targetFolder = path.join(repoPath, 'apps', folderName);
            const secretsPath = path.join(targetFolder, 'secrets.yaml');

            if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });

            const secrets = `secretData:\n${formatSecrets(secretObj)}`;
            fs.writeFileSync(secretsPath, secrets);

            try {
                execSync(`sops --encrypt --age ${ageKey} --encrypted-regex '^(secretData)$' --in-place ${secretsPath}`, { cwd: repoPath });
                console.log(`[Secrets] Generated standby secrets for ${folderName}`);
            } catch (e) {
                console.error(`Encryption failed for ${folderName}`, e);
            }
        };

        try {
            // 1. Generate PROD Manifests (Values + Secrets)
            processManifest(`${data.appId}-${data.appName}-prod`, 'app-prod', 'prod', appSecretsProd);

            if (data.dbType !== 'none') {
                processManifest(`${data.appId}-db-${data.appName}-prod`, 'db-prod', 'prod', dbSecretsProd);
            }

            // 2. Generate TESTING Secrets (Standby) - Only if provided
            if (Object.keys(appSecretsTest).length > 0) {
                generateSecretFile(`${data.appId}-${data.appName}-testing`, appSecretsTest);
            }
            
            if (data.dbType !== 'none' && Object.keys(dbSecretsTest).length > 0) {
                generateSecretFile(`${data.appId}-db-${data.appName}-testing`, dbSecretsTest);
            }

            // Update Registry
            try {
                let registry = [];
                if (fs.existsSync(registryPath)) {
                    const content = fs.readFileSync(registryPath, 'utf8');
                    try { registry = JSON.parse(content); } catch (e) { registry = []; }
                }
                const existingIdx = registry.findIndex(r => r.id === data.appId);
                const newEntry = {
                    id: data.appId,
                    name: data.appName,
                    image: `${safeImageRepo}:${data.imageTag}`,
                    db: data.dbType,
                    ingressHost: data.ingressEnabled ? data.ingressHost : null,
                    gitRepoUrl: data.gitRepoUrl || null,
                    createdAt: new Date().toISOString()
                };
                if (existingIdx >= 0) {
                    // Preserve testDomain if exists
                    if (registry[existingIdx].testDomain) newEntry.testDomain = registry[existingIdx].testDomain;
                    registry[existingIdx] = newEntry;
                } else {
                    registry.push(newEntry);
                }
                fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
            } catch (regError) {
                errors.push("Failed to update registry.json: " + regError.message);
            }

            if (errors.length > 0) {
                return NextResponse.json({ error: errors.join(', '), generated: generatedFolders }, { status: 400 });
            }

            // Commit & Push
            const commitMsg = `feat: add/update manifests for ${data.appName} (split structure + testing secrets)`;
            execSync(`git add .`, { cwd: repoPath });
            try {
                execSync(`git commit -m "${commitMsg}"`, { cwd: repoPath });
                execSync(`git push origin main`, { cwd: repoPath });
            } catch (e) {
                if (e.message.includes('nothing to commit')) {
                    return NextResponse.json({ message: "No changes detected." });
                }
                throw e;
            }

            // Jenkins... (Keep existing)
            let jenkinsMessage = '';
            if (data.gitRepoUrl) {
                try {
                    const jenkinsResult = await createPipelineJob({
                        appName: data.appName,
                        imageRepo: safeImageRepo,
                        gitRepoUrl: data.gitRepoUrl
                    });
                    if (jenkinsResult.success) {
                        jenkinsMessage = ` | ${jenkinsResult.message}`;
                    }
                } catch (jenkinsErr) {
                    console.error('[Jenkins] Failed to create pipeline:', jenkinsErr.message);
                }
            }

            return NextResponse.json({
                message: `Success! Generated ${generatedFolders.join(', ')}${jenkinsMessage}`,
                folders: generatedFolders
            });

        } catch (err) {
            console.error(err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    });
}
