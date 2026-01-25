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

        // --- CRITICAL FIX: Race Condition Check ---
        // Read registry freshly pulled from git to verify ID availability
        try {
            if (fs.existsSync(registryPath)) {
                const content = fs.readFileSync(registryPath, 'utf8');
                const currentRegistry = JSON.parse(content);

                // Check if the requested ID is already taken
                const isTaken = currentRegistry.some(app => app.id === data.appId);

                if (isTaken) {
                    console.log(`[CONFLICT] App ID ${data.appId} is already taken. Calculating new ID...`);

                    // Calculate new Max ID
                    let maxId = 0;
                    currentRegistry.forEach(app => {
                        const idNum = parseInt(app.id);
                        if (!isNaN(idNum) && idNum > maxId) {
                            maxId = idNum;
                        }
                    });

                    const newId = String(maxId + 1).padStart(3, '0');
                    console.log(`[RESOLVED] Auto-assigning new ID: ${newId}`);
                    data.appId = newId; // Override the ID
                }
            }
        } catch (e) {
            console.warn("Failed to validate App ID collision:", e.message);
            // Continue, worst case it overwrites or fails later
        }
        // ------------------------------------------

        const generatedFolders = [];
        const errors = [];

        let safeImageRepo = data.imageRepo;
        if (safeImageRepo && safeImageRepo.startsWith('dockerio/')) {
            safeImageRepo = safeImageRepo.replace('dockerio/', '');
        }

        // --- Helper: Generate YAML Content (Split Values & Secrets) ---
        const generateYaml = (templateType, env) => {
            const appName = data.appName;
            const appId = data.appId;

            // --- SECRETS Construction ---
            const appSecretObj = {};
            if (data.appSecrets && Array.isArray(data.appSecrets)) {
                data.appSecrets.forEach(s => {
                    let val = s.value;
                    if (env === 'prod' && s.valueProd) val = s.valueProd;
                    if (env === 'testing' && s.valueTest) val = s.valueTest;

                    if (s.key && val !== undefined && val !== null) {
                        appSecretObj[s.key] = val;
                    }
                });
            }

            if (data.dbType !== 'none') {
                const dbPort = data.dbType === 'postgres' ? "5432" : "3306";
                const dbName = data.appName.replace(/-/g, '_');

                // FORCE overwrite DB_HOST and DB_PORT to match the Service we are generating
                // FIX: Using FQDN because DB is in a separate isolated namespace now
                // Format: svc-db-{appName}-{id}.{id}-db-{appName}-{env}.svc.cluster.local
                appSecretObj["DB_HOST"] = `svc-db-${data.appName}-${data.appId}.${data.appId}-db-${data.appName}-${env}.svc.cluster.local`;
                appSecretObj["DB_PORT"] = dbPort;

                // --- Standardize Keys (Map DB_USER -> DB_USERNAME, etc.) ---
                if (appSecretObj["DB_NAME"] && !appSecretObj["DB_DATABASE"]) {
                    appSecretObj["DB_DATABASE"] = appSecretObj["DB_NAME"];
                }
                if (appSecretObj["DB_USER"] && !appSecretObj["DB_USERNAME"]) {
                    appSecretObj["DB_USERNAME"] = appSecretObj["DB_USER"];
                }
                if (appSecretObj["DB_PASS"] && !appSecretObj["DB_PASSWORD"]) {
                    appSecretObj["DB_PASSWORD"] = appSecretObj["DB_PASS"];
                }

                // --- Fill Defaults if still missing ---
                if (!appSecretObj["DB_DATABASE"]) appSecretObj["DB_DATABASE"] = dbName;
                if (!appSecretObj["DB_USERNAME"]) appSecretObj["DB_USERNAME"] = "admin";
                if (!appSecretObj["DB_PASSWORD"]) appSecretObj["DB_PASSWORD"] = "changeme_securely";
            }

            const dbSecretObj = {};
            if (data.dbSecrets && Array.isArray(data.dbSecrets)) {
                data.dbSecrets.forEach(s => {
                    let val = s.value;
                    if (env === 'prod' && s.valueProd) val = s.valueProd;
                    if (env === 'testing' && s.valueTest) val = s.valueTest;

                    if (val && typeof val === 'string') val = val.trim();

                    if (s.key && val !== undefined && val !== null) {
                        dbSecretObj[s.key] = val;
                    }
                });
            }

            if (data.dbType !== 'none') {
                const dbName = data.appName.replace(/-/g, '_');

                console.log("[DEBUG] Mapping DB Secrets for type:", data.dbType);
                console.log("[DEBUG] Initial dbSecretObj:", JSON.stringify(dbSecretObj, null, 2));

                if (data.dbType === 'postgres') {
                    // STRICT CLEANUP: Remove any MySQL keys that might have slipped in
                    Object.keys(dbSecretObj).forEach(k => {
                        if (k.startsWith('MYSQL_') || k.startsWith('MARIADB_')) delete dbSecretObj[k];
                    });

                    // FORCE: Gunakan Key standar Bitnami PostgreSQL (POSTGRESQL_*)
                    // Prioritaskan input dari dbSecretObj (Form DB Secrets), fallback ke appSecretObj (Form App Secrets)

                    const userDbName = dbSecretObj["POSTGRESQL_DATABASE"] || dbSecretObj["POSTGRES_DB"] || dbSecretObj["DB_NAME"] || appSecretObj["DB_NAME"] || dbName;
                    const userDbUser = dbSecretObj["POSTGRESQL_USERNAME"] || dbSecretObj["POSTGRES_USER"] || dbSecretObj["DB_USER"] || appSecretObj["DB_USER"] || "admin";
                    const userDbPass = dbSecretObj["POSTGRESQL_PASSWORD"] || dbSecretObj["POSTGRES_PASSWORD"] || dbSecretObj["DB_PASS"] || appSecretObj["DB_PASS"] || "changeme_securely";

                    dbSecretObj["POSTGRESQL_DATABASE"] = userDbName;
                    dbSecretObj["POSTGRESQL_USERNAME"] = userDbUser;
                    dbSecretObj["POSTGRESQL_PASSWORD"] = userDbPass;
                    dbSecretObj["POSTGRESQL_POSTGRES_PASSWORD"] = userDbPass; // Set postgres root pass

                    // Cleanup non-standard/old keys
                    delete dbSecretObj["POSTGRES_DB"];
                    delete dbSecretObj["POSTGRES_USER"];
                    delete dbSecretObj["POSTGRES_PASSWORD"];
                    delete dbSecretObj["DB_NAME"];
                    delete dbSecretObj["DB_USER"];
                    delete dbSecretObj["DB_PASS"];
                    delete dbSecretObj["DB_USERNAME"];
                    delete dbSecretObj["DB_PASSWORD"];
                    delete dbSecretObj["DB_DATABASE"];

                } else {
                    // STRICT CLEANUP: Remove any Postgres keys that might have slipped in
                    Object.keys(dbSecretObj).forEach(k => {
                        if (k.startsWith('POSTGRES_') || k.startsWith('POSTGRESQL_')) delete dbSecretObj[k];
                    });

                    // FORCE: Gunakan Key standar Bitnami MariaDB (MARIADB_*)
                    const userDbName = dbSecretObj["MARIADB_DATABASE"] || dbSecretObj["MYSQL_DATABASE"] || dbSecretObj["DB_NAME"] || appSecretObj["DB_NAME"] || dbName;
                    const userDbUser = dbSecretObj["MARIADB_USER"] || dbSecretObj["MYSQL_USER"] || dbSecretObj["DB_USER"] || appSecretObj["DB_USER"] || "admin";
                    const userDbPass = dbSecretObj["MARIADB_PASSWORD"] || dbSecretObj["MYSQL_PASSWORD"] || dbSecretObj["DB_PASS"] || appSecretObj["DB_PASS"] || "changeme_securely";

                    dbSecretObj["MARIADB_DATABASE"] = userDbName;
                    dbSecretObj["MARIADB_USER"] = userDbUser;
                    dbSecretObj["MARIADB_PASSWORD"] = userDbPass;
                    dbSecretObj["MARIADB_ROOT_PASSWORD"] = dbSecretObj["MARIADB_ROOT_PASSWORD"] || dbSecretObj["MYSQL_ROOT_PASSWORD"] || "changeme_root";

                    // Cleanup
                    delete dbSecretObj["MYSQL_DATABASE"];
                    delete dbSecretObj["MYSQL_USER"];
                    delete dbSecretObj["MYSQL_PASSWORD"];
                    delete dbSecretObj["MYSQL_ROOT_PASSWORD"];
                    delete dbSecretObj["DB_NAME"];
                    delete dbSecretObj["DB_USER"];
                    delete dbSecretObj["DB_PASS"];
                }
                console.log("[DEBUG] Final dbSecretObj:", JSON.stringify(dbSecretObj, null, 2));
            }

            const formatSecrets = (obj) => {
                if (Object.keys(obj).length === 0) return '{}';
                return Object.entries(obj)
                    .map(([k, v]) => {
                        const safeVal = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\"');
                        return `  ${k}: "${safeVal}"`;
                    })
                    .join('\n');
            };

            let values = "";
            let secrets = "";

            // A. APP PRODUCTION
            if (templateType === 'app-prod') {
                secrets = `secretData:\n${formatSecrets(appSecretObj)}`;
                values = `
namespace: prod
controllerType: Deployment

app:
  id: "${appId}"
  name: "${appName}"
  env: "prod"

image:
  repository: "${safeImageRepo}"
  tag: "${data.imageTag}"

service:
  port: ${data.servicePort}
  targetPort: ${data.targetPort}
`.trim();

                if (data.migrationEnabled) {
                    values += `

migration:
  enabled: true
  command: "${data.migrationCommand}"`;
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

            // B. APP TESTING
            if (templateType === 'app-testing') {
                secrets = `secretData:\n${formatSecrets(appSecretObj)}`;
                values = `
namespace: testing
controllerType: Deployment

app:
  id: "${appId}"
  name: "${appName}"
  env: "testing"

image:
  repository: "${data.imageRepo}"
  tag: "${data.imageTag}"

service:
  type: NodePort
  port: ${data.servicePort}
  targetPort: ${data.targetPort}
`.trim();

                if (data.migrationEnabled) {
                    values += `

migration:
  enabled: true
  command: "${data.migrationCommand}"`;
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
    - host: "test-${data.ingressHost}"
      path: /
`;
                }
            }

            // C. DB PRODUCTION
            if (templateType === 'db-prod') {
                const dbImage = data.dbType === 'postgres' ? 'devopsnaratel/postgresql' : 'devopsnaratel/mariadb';
                const dbTag = data.dbType === 'postgres' ? '18.1' : '12.1.2';
                const dbPort = data.dbType === 'postgres' ? 5432 : 3306;

                secrets = `secretData:\n${formatSecrets(dbSecretObj)}`;
                values = `
namespace: prod
controllerType: StatefulSet

app:
  id: "${appId}"
  name: "db-${appName}"
  env: "prod"

image:
  repository: "${dbImage}"
  tag: "${dbTag}"

service:
  port: ${dbPort}
  targetPort: ${dbPort}

backup:
  enabled: true
  type: "${data.dbType}"
`.trim();
            }

            // D. DB TESTING
            if (templateType === 'db-testing') {
                const dbImage = data.dbType === 'postgres' ? 'devopsnaratel/postgresql' : 'devopsnaratel/mariadb';
                const dbTag = data.dbType === 'postgres' ? '18.1' : '12.1.2';
                const dbPort = data.dbType === 'postgres' ? 5432 : 3306;

                secrets = `secretData:\n${formatSecrets(dbSecretObj)}`;
                values = `
namespace: testing
controllerType: StatefulSet

app:
  id: "${appId}"
  name: "${appName}-db"
  env: "testing"

image:
  repository: "${dbImage}"
  tag: "${dbTag}"

service:
  port: ${dbPort}
  targetPort: ${dbPort}

backup:
  enabled: true
  type: "${data.dbType}"
`.trim();
            }

            return { values, secrets, appSecretObj, dbSecretObj };
        };


        // --- Helper: Write & Encrypt ---
        const processManifest = (folderName, type, env) => {
            const targetFolder = path.join(repoPath, 'apps', folderName);
            const valuesPath = path.join(targetFolder, 'values.yaml');
            const secretsPath = path.join(targetFolder, 'secrets.yaml');

            if (fs.existsSync(targetFolder)) {
                console.log(`Folder ${folderName} exists, updating...`);
            } else {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            const { values, secrets, appSecretObj, dbSecretObj } = generateYaml(type, env);

            // DEBUG: Log the secrets being generated to verify values (Keys only for safety)
            console.log(`[DEBUG] Generating ${folderName} (${env}):`);
            if (type.startsWith('app')) {
                console.log("App Secret Keys:", Object.keys(appSecretObj));
            } else {
                console.log("DB Secret Keys:", Object.keys(dbSecretObj));
            }

            // 1. Write Plaintext Values
            fs.writeFileSync(valuesPath, values);

            // 2. Write Secrets
            fs.writeFileSync(secretsPath, secrets);

            // 3. Encrypt Secrets ONLY
            try {
                execSync(`sops --encrypt --age ${ageKey} --encrypted-regex '^(secretData)$' --in-place ${secretsPath}`, { cwd: repoPath });
                generatedFolders.push(folderName);
            } catch (e) {
                console.error(`Encryption failed for ${folderName}`, e);
                errors.push(`Encryption failed for ${folderName}: ${e.message}`);
            }
        };


        try {
            // GENERATE PROD ONLY (Testing is now Ephemeral/On-Demand via Jenkins)
            processManifest(`${data.appName}-prod`, 'app-prod', 'prod');

            if (data.dbType !== 'none') {
                processManifest(`${data.appName}-db-prod`, 'db-prod', 'prod');
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
            const commitMsg = `feat: add/update manifests for ${data.appName} (split structure)`;
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

            // Create Jenkins Pipeline Job (if gitRepoUrl provided)
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
                        console.log(`[Jenkins] ${jenkinsResult.message}`);
                    } else {
                        jenkinsMessage = ` | Jenkins: ${jenkinsResult.message}`;
                        console.warn(`[Jenkins] ${jenkinsResult.message}`);
                    }
                } catch (jenkinsErr) {
                    console.error('[Jenkins] Failed to create pipeline:', jenkinsErr.message);
                    jenkinsMessage = ' | Jenkins pipeline creation failed (non-blocking)';
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