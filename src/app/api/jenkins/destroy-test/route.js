import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { gitMutex } from '@/lib/gitMutex';

export async function POST(req) {
  try {
    const data = await req.json();
    const { appName } = data;

    if (!appName) {
        return NextResponse.json({ error: "appName is required" }, { status: 400 });
    }

    const repoDirName = 'manifest-repo-workdir';
    const repoPath = path.join(os.tmpdir(), repoDirName);
    
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

        const registryPath = path.join(repoPath, 'registry.json');
        let appId = null;
        if (fs.existsSync(registryPath)) {
            try {
                const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                const appEntry = registry.find(a => a.name === appName);
                if (appEntry) appId = appEntry.id;
            } catch (e) { console.error("Failed to parse registry", e); }
        }

        const foldersToDelete = [
            path.join(repoPath, 'apps', `${appId}-${appName}-testing`),
            path.join(repoPath, 'apps', `${appId}-db-${appName}-testing`),
            path.join(repoPath, 'apps', `${appName}-testing`),
            path.join(repoPath, 'apps', `${appName}-db-testing`)
        ];

        let deletedCount = 0;

        foldersToDelete.forEach(folder => {
            if (fs.existsSync(folder)) {
                fs.rmSync(folder, { recursive: true, force: true });
                deletedCount++;
                console.log(`Deleted: ${folder}`);
            }
        });

        if (deletedCount === 0) {
            return NextResponse.json({ message: "No testing environments found to destroy." });
        }

        // 2. Commit & Push
        execSync(`git add .`, { cwd: repoPath });
        const commitMsg = `chore: destroy ephemeral testing for ${appName}`;
        
        try {
             execSync(`git commit -m "${commitMsg}"`, { cwd: repoPath });
             execSync(`git push origin main`, { cwd: repoPath });
        } catch (e) {
             if (e.message.includes('nothing to commit')) {
                 return NextResponse.json({ message: "Already clean." });
             }
             throw e;
        }

        return NextResponse.json({ message: "Ephemeral environment destroyed successfully." });

    });

  } catch (err) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
