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
    if (!fs.existsSync(filePath)) return {};
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = yaml.load(content);
        const secrets = parsed.secretData || {};
        
        const result = {};
        Object.keys(secrets).forEach(k => {
            result[k] = ""; 
        });
        return result;
    } catch (e) {
        console.error(`Failed to read keys from ${filePath}:`, e.message);
        return {};
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
            
            // TARGET secrets.yaml (PROD ONLY)
            const appProdPath = path.join(appsPath, `${appName}-prod`, 'secrets.yaml');
            const dbProdPath = path.join(appsPath, `${appName}-db-prod`, 'secrets.yaml');

            const appProdKeys = readSecretKeys(appProdPath);
            
            // Check based on folder existence, assuming db folder implies db exists
            const dbProdFolder = path.dirname(dbProdPath);
            const dbExists = fs.existsSync(dbProdFolder);
            
            const dbProdKeys = dbExists ? readSecretKeys(dbProdPath) : {};

            const mapKeys = (prodObj) => {
                const keys = Object.keys(prodObj);
                const result = [];
                keys.forEach(key => {
                    result.push({ key, valueProd: "" });
                });
                return result;
            };

            const appSecretsMerged = mapKeys(appProdKeys);
            const dbSecretsMerged = mapKeys(dbProdKeys);

            return NextResponse.json({
                appSecrets: appSecretsMerged,
                dbSecrets: dbSecretsMerged,
                hasDb: dbExists,
                mode: "overwrite"
            });

        } catch (err) {
            console.error(err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    });
}

const overwriteSecretFile = (filePath, newSecrets, agePubKey) => {
    // If file doesn't exist (migration case), create it?
    // Generator ensures it exists for NEW apps.
    // For OLD apps, we might need to create it.
    // Let's create it if directory exists.
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) return;

    try {
        const cleanSecrets = {};
        Object.entries(newSecrets).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
                cleanSecrets[k] = v;
            }
        });

        // Always reconstruct minimal structure
        const doc = { secretData: cleanSecrets };

        const newYaml = yaml.dump(doc, { lineWidth: -1 });
        fs.writeFileSync(filePath, newYaml);

        // Encrypt using PUBLIC KEY
        execSync(`sops --encrypt --age ${agePubKey} --encrypted-regex '^(secretData)$' --in-place "${filePath}"`);
        
    } catch (e) {
        throw new Error(`Failed to overwrite ${path.basename(filePath)}: ${e.message}`);
    }
};

export async function POST(req) {
    const { appName, appSecrets, dbSecrets } = await req.json();
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
            
            // --- PROCESS APP SECRETS (PROD ONLY) ---
            if (appSecrets && Array.isArray(appSecrets)) {
                const appProdObj = {};
                appSecrets.forEach(s => {
                    if (s.key) {
                        if (s.valueProd !== undefined && s.valueProd !== null) appProdObj[s.key] = s.valueProd;
                    }
                });

                const appProdPath = path.join(appsPath, `${appName}-prod`, 'secrets.yaml');
                overwriteSecretFile(appProdPath, appProdObj, agePubKey);
            }

            // --- PROCESS DB SECRETS (PROD ONLY) ---
            if (dbSecrets && Array.isArray(dbSecrets)) {
                const dbProdObj = {};
                dbSecrets.forEach(s => {
                    if (s.key) {
                        if (s.valueProd !== undefined && s.valueProd !== null) dbProdObj[s.key] = s.valueProd;
                    }
                });

                const dbProdPath = path.join(appsPath, `${appName}-db-prod`, 'secrets.yaml');
                // Only overwrite if paths exist (or just try, the helper handles check)
                overwriteSecretFile(dbProdPath, dbProdObj, agePubKey);
            }

            execSync(`git add .`, { cwd: repoPath });
            const status = execSync(`git status --porcelain`, { cwd: repoPath }).toString();
            
            if (status.trim()) {
                execSync(`git commit -m "chore: update secrets for ${appName} (overwrite)"`, { cwd: repoPath });
                execSync(`git push origin main`, { cwd: repoPath });
                return NextResponse.json({ message: "Secrets overwritten and encrypted successfully!" });
            } else {
                return NextResponse.json({ message: "No changes detected." });
            }

        } catch (err) {
            console.error(err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    });
}
