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
        repoPath: path.join(os.tmpdir(), 'manifest-repo-workdir'),
        token: process.env.GITHUB_TOKEN,
        repoUrl: process.env.MANIFEST_REPO_URL,
        userName: process.env.GIT_USER_NAME || "Naratel DevOps Dashboard",
        userEmail: process.env.GIT_USER_EMAIL || "devops@naratel.com"
    };
};

const readIngressConfig = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = yaml.load(content);
        
        const ing = parsed.ingress || {};
        const host = ing.hosts && ing.hosts[0] ? ing.hosts[0].host : "";
        
        return {
            enabled: ing.enabled || false,
            host: host,
            tls: !!(ing.tls && ing.tls.length > 0)
        };
    } catch (e) {
        console.error(`Failed to read ${filePath}:`, e.message);
        return null;
    }
};

const updateIngressConfig = (filePath, config, isTesting, appName) => {
    if (!fs.existsSync(filePath)) return;

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const doc = yaml.load(content);

        if (!config.enabled) {
            doc.ingress = { enabled: false };
        } else {
            const targetHost = isTesting ? `test-${config.host}` : config.host;
            doc.ingress = {
                enabled: true,
                className: "nginx",
                hosts: [ { host: targetHost, path: "/" } ]
            };
            if (config.tls) {
                doc.ingress.tls = [ { secretName: `${appName}-tls`, hosts: [targetHost] } ];
            } else {
                delete doc.ingress.tls;
            }
        }

        const newYaml = yaml.dump(doc, { lineWidth: -1 });
        fs.writeFileSync(filePath, newYaml);
        // NO ENCRYPTION NEEDED for values.yaml

    } catch (e) {
        throw new Error(`Failed to update ${path.basename(filePath)}: ${e.message}`);
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

            const prodPath = path.join(repoPath, 'apps', `${appName}-prod`, 'values.yaml');
            const config = readIngressConfig(prodPath);

            return NextResponse.json(config || { enabled: false, host: "", tls: false });

        } catch (err) {
            console.error(err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    });
}

export async function POST(req) {
    const { appName, enabled, host, tls } = await req.json();
    if (!appName) return NextResponse.json({ error: "Missing App Name" }, { status: 400 });

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

            const prodPath = path.join(repoPath, 'apps', `${appName}-prod`, 'values.yaml');
            const testPath = path.join(repoPath, 'apps', `${appName}-testing`, 'values.yaml');

            const config = { enabled, host, tls };

            updateIngressConfig(prodPath, config, false, appName);
            // Testing ingress config is handled during ephemeral deployment copy logic

            // Update Registry to sync ingressHost
            const registryPath = path.join(repoPath, 'registry.json');
            if (fs.existsSync(registryPath)) {
                try {
                    let registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                    const idx = registry.findIndex(r => r.name === appName);
                    if (idx >= 0) {
                        registry[idx].ingressHost = enabled ? host : null;
                        fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
                    }
                } catch (regErr) {
                    console.error("Registry sync failed:", regErr.message);
                }
            }

            execSync(`git add .`, { cwd: repoPath });
            const status = execSync(`git status --porcelain`, { cwd: repoPath }).toString();
            
            if (status.trim()) {
                execSync(`git commit -m "chore: update ingress config for ${appName}"`, { cwd: repoPath });
                execSync(`git push origin main`, { cwd: repoPath });
                return NextResponse.json({ message: "Ingress configuration updated!" });
            } else {
                return NextResponse.json({ message: "No changes detected." });
            }

        } catch (err) {
            console.error(err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    });
}
