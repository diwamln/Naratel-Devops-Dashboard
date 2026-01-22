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
    const { appName, env, imageTag } = data; // env: 'prod' or 'testing'

    if (!appName || !env || !imageTag) {
        return NextResponse.json({ error: "appName, env, and imageTag are required" }, { status: 400 });
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

        const targetFolder = path.join(repoPath, 'apps', `${appName}-${env}`);
        const valuesPath = path.join(targetFolder, 'values.yaml');

        if (!fs.existsSync(valuesPath)) {
             return NextResponse.json({ error: `Manifest folder for ${appName}-${env} not found.` }, { status: 404 });
        }

        // 2. Read & Update Yaml
        const fileContent = fs.readFileSync(valuesPath, 'utf8');
        let values = yaml.load(fileContent);

        // Update Tag
        if (values.image) {
            values.image.tag = imageTag;
        } else {
             return NextResponse.json({ error: "Invalid values.yaml structure: missing image key" }, { status: 400 });
        }

        // Write Back
        fs.writeFileSync(valuesPath, yaml.dump(values));

        // 3. Commit & Push
        execSync(`git add .`, { cwd: repoPath });
        const commitMsg = `ci: update ${appName}-${env} to version ${imageTag}`;
        
        try {
             execSync(`git commit -m "${commitMsg}"`, { cwd: repoPath });
             execSync(`git push origin main`, { cwd: repoPath });
        } catch (e) {
             if (e.message.includes('nothing to commit')) {
                 return NextResponse.json({ message: "Version already up-to-date." });
             }
             throw e;
        }

        return NextResponse.json({ message: `Successfully updated ${appName}-${env} to tag ${imageTag}` });
    });

  } catch (err) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
