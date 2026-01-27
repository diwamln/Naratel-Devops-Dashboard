import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import { gitMutex } from '@/lib/gitMutex';

export const dynamic = 'force-dynamic';

const getRepoConfig = () => {
    return {
        repoDirName: 'manifest-repo-workdir',
        repoPath: path.join(os.tmpdir(), 'manifest-repo-workdir'),
        token: process.env.GITHUB_TOKEN,
        repoUrl: process.env.MANIFEST_REPO_URL,
        userName: process.env.GIT_USER_NAME || "Naratel DevOps Dashboard",
        userEmail: process.env.GIT_USER_EMAIL || "devops@naratel.com",
        agePubKey: process.env.SOPS_AGE_PUBKEY || "age1ywhtcmyuhmfa32kfaaxcak4dvq27q9g6m55gqlzu2vlwkgfj24wq3g4ejx"
    };
};

const readSecretKeys = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = yaml.load(content);
        const secrets = parsed.secretData || {};
        return Object.keys(secrets);
    } catch (e) {
        console.error(`Failed to read keys from ${filePath}:`, e.message);
        return [];
    }
};

const overwriteSecretFile = (filePath, newSecrets, agePubKey) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    try {
        const cleanSecrets = {};
        // newSecrets is an array of {key, value} or object
        // The API sends array of {key, value}.
        if (Array.isArray(newSecrets)) {
            newSecrets.forEach(s => {
                if (s.key && s.value !== undefined) cleanSecrets[s.key] = s.value;
            });
        } else {
            Object.entries(newSecrets).forEach(([k, v]) => {
                if (v !== undefined) cleanSecrets[k] = v;
            });
        }

        const doc = { secretData: cleanSecrets };
        const newYaml = yaml.dump(doc, { lineWidth: -1 });
        fs.writeFileSync(filePath, newYaml);

        execSync(`sops --encrypt --age ${agePubKey} --encrypted-regex '^(secretData)$' --in-place "${filePath}"`);
    } catch (e) {
        throw new Error(`Failed to overwrite ${path.basename(filePath)}: ${e.message}`);
    }
};

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const appName = searchParams.get('appName');
    if (!appName) return NextResponse.json({ error: "App Name required" }, { status: 400 });

    return await gitMutex.runExclusive(async () => {
        const { repoPath, repoUrl, token, userName, userEmail } = getRepoConfig();
        const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);

        try {
            if (!fs.existsSync(repoPath)) {
                execSync(`git clone ${authenticatedUrl} ${repoPath}`);
            } else {
                try {
                    execSync(`git fetch origin`, { cwd: repoPath });
                    execSync(`git reset --hard origin/main`, { cwd: repoPath });
                } catch (e) {
                    fs.rmSync(repoPath, { recursive: true, force: true });
                    execSync(`git clone ${authenticatedUrl} ${repoPath}`);
                }
            }
            execSync(`git config user.name "${userName}"`, { cwd: repoPath });
            execSync(`git config user.email "${userEmail}"`, { cwd: repoPath });

            const appsPath = path.join(repoPath, 'apps');
            const registryPath = path.join(repoPath, 'registry.json');
            
            let appId = null;
            if (fs.existsSync(registryPath)) {
                try {
                    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                    const appEntry = registry.find(a => a.name === appName);
                    if (appEntry) appId = appEntry.id;
                } catch (e) { console.error("Failed to parse registry", e); }
            }

            // Define Paths
            let appProdPath = path.join(appsPath, `${appId}-${appName}-prod`, 'secrets.yaml');
            let appTestPath = path.join(appsPath, `${appId}-${appName}-testing`, 'secrets.yaml');
            
            let dbProdPath = path.join(appsPath, `${appId}-db-${appName}-prod`, 'secrets.yaml');
            let dbTestPath = path.join(appsPath, `${appId}-db-${appName}-testing`, 'secrets.yaml');

            // Legacy Fallback
            if (!fs.existsSync(path.dirname(appProdPath))) {
                appProdPath = path.join(appsPath, `${appName}-prod`, 'secrets.yaml');
                // Assume legacy structure implies legacy testing path too if exists
                appTestPath = path.join(appsPath, `${appName}-testing`, 'secrets.yaml');
            }
            if (!fs.existsSync(path.dirname(dbProdPath))) {
                dbProdPath = path.join(appsPath, `${appName}-db-prod`, 'secrets.yaml');
                dbTestPath = path.join(appsPath, `${appName}-db-testing`, 'secrets.yaml');
            }

            // Read Keys
            const appKeysProd = readSecretKeys(appProdPath);
            const appKeysTest = readSecretKeys(appTestPath);
            const dbKeysProd = readSecretKeys(dbProdPath);
            const dbKeysTest = readSecretKeys(dbTestPath);

            // Merge Unique Keys
            const mergeKeys = (keysA, keysB) => Array.from(new Set([...keysA, ...keysB]));
            
            const appAllKeys = mergeKeys(appKeysProd, appKeysTest);
            const dbAllKeys = mergeKeys(dbKeysProd, dbKeysTest);

            const appSecrets = appAllKeys.map(k => ({ key: k }));
            const dbSecrets = dbAllKeys.map(k => ({ key: k }));

            return NextResponse.json({
                appSecrets,
                dbSecrets,
                hasDb: fs.existsSync(path.dirname(dbProdPath))
            });

        } catch (err) {
            console.error(err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    });
}

export async function POST(req) {
    const { appName, appSecrets, appSecretsTest, dbSecrets, dbSecretsTest } = await req.json();
    if (!appName) return NextResponse.json({ error: "Missing App Name" }, { status: 400 });

    return await gitMutex.runExclusive(async () => {
        const { repoPath, repoUrl, token, userName, userEmail, agePubKey } = getRepoConfig();
        const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);

        try {
            if (!fs.existsSync(repoPath)) {
                execSync(`git clone ${authenticatedUrl} ${repoPath}`);
            } else {
                 try {
                    execSync(`git fetch origin`, { cwd: repoPath });
                    execSync(`git reset --hard origin/main`, { cwd: repoPath });
                } catch (e) {
                    fs.rmSync(repoPath, { recursive: true, force: true });
                    execSync(`git clone ${authenticatedUrl} ${repoPath}`);
                }
            }
            execSync(`git config user.name "${userName}"`, { cwd: repoPath });
            execSync(`git config user.email "${userEmail}"`, { cwd: repoPath });

            const appsPath = path.join(repoPath, 'apps');
            const registryPath = path.join(repoPath, 'registry.json');
            
            let appId = null;
            if (fs.existsSync(registryPath)) {
                try {
                    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                    const appEntry = registry.find(a => a.name === appName);
                    if (appEntry) appId = appEntry.id;
                } catch (e) { console.error("Failed to parse registry", e); }
            }
            
            const getPaths = (type) => {
                let prod = path.join(appsPath, `${appId}-${type === 'db' ? 'db-' : ''}${appName}-prod`, 'secrets.yaml');
                let test = path.join(appsPath, `${appId}-${type === 'db' ? 'db-' : ''}${appName}-testing`, 'secrets.yaml');
                
                // Legacy check
                if (!fs.existsSync(path.dirname(prod))) {
                    prod = path.join(appsPath, `${type === 'db' ? '' : ''}${appName}${type === 'db' ? '-db' : ''}-prod`, 'secrets.yaml'); // Naming was inconsistent? Assuming consistent new naming.
                    // Fallback to simpler check:
                    if (!fs.existsSync(path.dirname(path.join(appsPath, `${appId}-${type === 'db' ? 'db-' : ''}${appName}-prod`)))) {
                         // Attempt legacy
                         const legacyBase = path.join(appsPath, `${appName}${type === 'db' ? '-db' : ''}`);
                         prod = legacyBase + '-prod/secrets.yaml';
                         test = legacyBase + '-testing/secrets.yaml';
                    }
                }
                return { prod, test };
            };

            // APP SECRETS
            const appPaths = getPaths('app');
            if (appSecrets && appSecrets.length > 0) overwriteSecretFile(appPaths.prod, appSecrets, agePubKey);
            if (appSecretsTest && appSecretsTest.length > 0) overwriteSecretFile(appPaths.test, appSecretsTest, agePubKey);

            // DB SECRETS
            const dbPaths = getPaths('db');
            if (dbSecrets && dbSecrets.length > 0) overwriteSecretFile(dbPaths.prod, dbSecrets, agePubKey);
            if (dbSecretsTest && dbSecretsTest.length > 0) overwriteSecretFile(dbPaths.test, dbSecretsTest, agePubKey);

            execSync(`git add .`, { cwd: repoPath });
            const status = execSync(`git status --porcelain`, { cwd: repoPath }).toString();
            
            if (status.trim()) {
                execSync(`git commit -m "chore: update secrets for ${appName} (prod/test)"`, { cwd: repoPath });
                execSync(`git push origin main`, { cwd: repoPath });
                return NextResponse.json({ message: "Secrets updated successfully for both environments!" });
            } else {
                return NextResponse.json({ message: "No changes detected." });
            }

        } catch (err) {
            console.error(err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    });
}