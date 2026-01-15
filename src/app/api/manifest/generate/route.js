import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req) {
  const data = await req.json();
  
  const repoDirName = 'manifest-repo-workdir';
  const repoPath = path.join(os.tmpdir(), repoDirName);
  const registryPath = path.join(repoPath, 'registry.json');
  
  const token = process.env.GITHUB_TOKEN;
  const repoUrl = process.env.MANIFEST_REPO_URL;
  const userName = process.env.GIT_USER_NAME || "Naratel DevOps Dashboard";
  const userEmail = process.env.GIT_USER_EMAIL || "devops@naratel.com";
  const ageKey = "age1ywhtcmyuhmfa32kfaaxcak4dvq27q9g6m55gqlzu2vlwkgfj24wq3g4ejx";

  if (!repoUrl || !token) {
      return NextResponse.json({ error: "Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing." }, { status: 500 });
  }

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

  const generatedFolders = [];
  const errors = [];

  // Sanitize Image Repo (Remove accidental 'dockerio/' prefix)
  let safeImageRepo = data.imageRepo;
  if (safeImageRepo && safeImageRepo.startsWith('dockerio/')) {
      safeImageRepo = safeImageRepo.replace('dockerio/', '');
  }

  // --- Helper: Generate YAML Content ---
  const generateYaml = (templateType, env) => {
    // Common Variables
    const appName = data.appName;
    const appId = data.appId;
    
    // --- APP SECRETS Construction ---
    const appSecretObj = {};
    if (data.appSecrets && Array.isArray(data.appSecrets)) {
        data.appSecrets.forEach(s => {
            let val = s.value;
            if (env === 'prod' && s.valueProd) val = s.valueProd;
            if (env === 'testing' && s.valueTest) val = s.valueTest;
            
            if (s.key && val) appSecretObj[s.key] = val;
        });
    }

    // Auto-inject DB Connection info into APP Secrets if DB is enabled
    if (data.dbType !== 'none') {
        const dbPort = data.dbType === 'postgres' ? "5432" : "3306";
        const dbName = data.appName.replace(/-/g, '_'); 
        
        // Default Connection Vars
        if (!appSecretObj["DB_HOST"]) appSecretObj["DB_HOST"] = `${data.appName}`;
        if (!appSecretObj["DB_PORT"]) appSecretObj["DB_PORT"] = dbPort;
        if (!appSecretObj["DB_NAME"]) appSecretObj["DB_NAME"] = dbName;
        if (!appSecretObj["DB_USER"]) appSecretObj["DB_USER"] = "admin";
        if (!appSecretObj["DB_PASSWORD"]) appSecretObj["DB_PASSWORD"] = "changeme_securely";
    }

    // --- DB SECRETS Construction ---
    const dbSecretObj = {};
    if (data.dbSecrets && Array.isArray(data.dbSecrets)) {
        data.dbSecrets.forEach(s => {
             let val = s.value;
             if (env === 'prod' && s.valueProd) val = s.valueProd;
             if (env === 'testing' && s.valueTest) val = s.valueTest;
             
             // Ensure we treat whitespace-only strings as empty so defaults kick in
             if (val && typeof val === 'string') {
                 val = val.trim();
             }

             if (s.key && val) dbSecretObj[s.key] = val;
        });
    }
    
    // Auto-inject Defaults for DB Container if DB is enabled
    if (data.dbType !== 'none') {
         const dbName = data.appName.replace(/-/g, '_'); 
         if (data.dbType === 'postgres') {
            if (!dbSecretObj["POSTGRES_DB"]) dbSecretObj["POSTGRES_DB"] = dbName;
            if (!dbSecretObj["POSTGRES_USER"]) dbSecretObj["POSTGRES_USER"] = "admin";
            if (!dbSecretObj["POSTGRES_PASSWORD"]) dbSecretObj["POSTGRES_PASSWORD"] = "changeme_securely";
         } else {
            if (!dbSecretObj["MYSQL_DATABASE"]) dbSecretObj["MYSQL_DATABASE"] = dbName;
            if (!dbSecretObj["MYSQL_USER"]) dbSecretObj["MYSQL_USER"] = "admin";
            if (!dbSecretObj["MYSQL_PASSWORD"]) dbSecretObj["MYSQL_PASSWORD"] = "changeme_securely";
            if (!dbSecretObj["MYSQL_ROOT_PASSWORD"]) dbSecretObj["MYSQL_ROOT_PASSWORD"] = "changeme_root";
         }
    }


    // --- TEMPLATE LOGIC ---
    // Helper to format secrets safely
    const formatSecrets = (obj) => {
        if (Object.keys(obj).length === 0) return '{}';
        return Object.entries(obj)
            .map(([k, v]) => {
                // Escape double quotes and backslashes
                const safeVal = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                return `  ${k}: "${safeVal}"`;
            })
            .join('\n');
    };

    // A. APP PRODUCTION
    if (templateType === 'app-prod') {
        const secretYamlLines = formatSecrets(appSecretObj);

        let yaml = `
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

secretData:
${secretYamlLines}
`.trim();

        if (data.dbType !== 'none') {
            yaml += `\n\nbackup:\n  enabled: true\n  type: "${data.dbType}"`;
        }

        if (data.ingressEnabled) {
            yaml += `\n\ningress:\n  enabled: true\n  className: "nginx"\n  hosts:\n    - host: "${data.ingressHost}"\n      path: /`;
            if (data.tlsEnabled) {
                yaml += `\n  tls:\n    - secretName: "${appName}-tls"\n      hosts:\n        - "${data.ingressHost}"`;
            }
        }
        return yaml;
    }

    // B. APP TESTING
    if (templateType === 'app-testing') {
        const secretYamlLines = formatSecrets(appSecretObj);

        let yaml = `
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
  port: ${data.servicePort}
  targetPort: ${data.targetPort}

secretData:
${secretYamlLines}
`.trim();

        if (data.ingressEnabled) {
            yaml += `\n\ningress:\n  enabled: true\n  className: "nginx"\n  hosts:\n    - host: "test-${data.ingressHost}"\n      path: /`;
        }
        return yaml;
    }

    // C. DB PRODUCTION
    if (templateType === 'db-prod') {
        const secretYamlLines = formatSecrets(dbSecretObj);

        const dbImage = data.dbType === 'postgres' ? 'postgres' : 'mariadb';
        const dbTag = data.dbType === 'postgres' ? '15-alpine' : '10.11'; 
        const dbPort = data.dbType === 'postgres' ? 5432 : 3306;

        let yaml = `
namespace: prod
controllerType: StatefulSet

app:
  id: "${appId}"
  name: "${appName}-db"
  env: "prod"

image:
  repository: "${dbImage}"
  tag: "${dbTag}"

service:
  port: ${dbPort}
  targetPort: ${dbPort}

secretData:
${secretYamlLines}

backup:
  enabled: true
  type: "${data.dbType}"
`.trim();
        return yaml;
    }

    // D. DB TESTING
    if (templateType === 'db-testing') {
        const secretYamlLines = formatSecrets(dbSecretObj);

        const dbImage = data.dbType === 'postgres' ? 'postgres' : 'mariadb';
        const dbTag = data.dbType === 'postgres' ? '15-alpine' : '10.11';
        const dbPort = data.dbType === 'postgres' ? 5432 : 3306;

        let yaml = `
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

secretData:
${secretYamlLines}
`.trim();
        return yaml;
    }
  };


  // --- Helper: Write & Encrypt ---
  const processManifest = (folderName, type, env) => {
      const targetFolder = path.join(repoPath, 'apps', folderName);
      const filePath = path.join(targetFolder, 'values.yaml');

      if (fs.existsSync(targetFolder)) {
          console.log(`Folder ${folderName} exists, overwriting...`);
      } else {
          fs.mkdirSync(targetFolder, { recursive: true });
      }

      const yamlContent = generateYaml(type, env);
      fs.writeFileSync(filePath, yamlContent);

      // Encrypt with SOPS
      try {
          execSync(`sops --encrypt --age ${ageKey} --encrypted-regex '^(secretData)$' --in-place ${filePath}`, { cwd: repoPath });
          generatedFolders.push(folderName);
      } catch (e) {
          console.error(`Encryption failed for ${folderName}`, e);
          errors.push(`Encryption failed for ${folderName}: ${e.message}`);
      }
  };


  try {
      // 1. App Prod
      processManifest(`${data.appName}-prod`, 'app-prod', 'prod');

      // 2. App Testing
      processManifest(`${data.appName}-testing`, 'app-testing', 'testing');

      // 3. DB (if enabled)
      if (data.dbType !== 'none') {
          processManifest(`${data.appName}-db-prod`, 'db-prod', 'prod');
          processManifest(`${data.appName}-db-testing`, 'db-testing', 'testing');
      }

      // --- 4. Update REGISTRY.JSON ---
      try {
          let registry = [];
          if (fs.existsSync(registryPath)) {
              const content = fs.readFileSync(registryPath, 'utf8');
              try { registry = JSON.parse(content); } catch (e) { registry = []; }
          }
          
          // Check if ID already exists, if so update, else append
          const existingIdx = registry.findIndex(r => r.id === data.appId);
          const newEntry = {
              id: data.appId,
              name: data.appName,
              image: `${safeImageRepo}:${data.imageTag}`,
              db: data.dbType,
              createdAt: new Date().toISOString()
          };

          if (existingIdx >= 0) {
              registry[existingIdx] = newEntry;
          } else {
              registry.push(newEntry);
          }

          fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
          console.log("Updated registry.json");

      } catch (regError) {
          console.error("Failed to update registry:", regError);
          errors.push("Failed to update registry.json: " + regError.message);
      }


      if (errors.length > 0) {
          return NextResponse.json({ error: errors.join(', '), generated: generatedFolders }, { status: 400 });
      }

      if (generatedFolders.length === 0) {
          return NextResponse.json({ error: "No manifests were generated." }, { status: 400 });
      }

      // --- Commit & Push ---
      const commitMsg = `feat: add manifests for ${data.appName} (ID: ${data.appId})`;
      
      execSync(`git add .`, { cwd: repoPath });
      try {
          execSync(`git commit -m "${commitMsg}"`, { cwd: repoPath });
          execSync(`git push origin main`, { cwd: repoPath });
      } catch (e) {
          if (e.message.includes('nothing to commit')) {
              return NextResponse.json({ message: "No changes detected (manifests already match)." });
          }
          throw e;
      }

      return NextResponse.json({
          message: `Success! Generated and pushed: ${generatedFolders.join(', ')}`,
          folders: generatedFolders
      });

  } catch (err) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
