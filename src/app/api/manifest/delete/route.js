import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { gitMutex } from '@/lib/gitMutex';
import { deleteJob } from '@/lib/jenkins';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    const { appId, appName } = await req.json();

    if (!appId || !appName) {
        return NextResponse.json({ error: "Missing appId or appName" }, { status: 400 });
    }

    return await gitMutex.runExclusive(async () => {
        const repoDirName = 'manifest-repo-workdir';
        const repoPath = path.join(os.tmpdir(), repoDirName);
        const registryPath = path.join(repoPath, 'registry.json');
        const appsPath = path.join(repoPath, 'apps');

        const token = process.env.GITHUB_TOKEN;
        const repoUrl = process.env.MANIFEST_REPO_URL;
        const userName = process.env.GIT_USER_NAME || "Naratel DevOps Dashboard";
        const userEmail = process.env.GIT_USER_EMAIL || "devops@naratel.com";

        if (!repoUrl || !token) {
            return NextResponse.json({ error: "Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing." }, { status: 500 });
        }

        try {
            // --- 1. Git Setup (Clone/Pull) ---
            const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);

            if (!fs.existsSync(repoPath)) {
                execSync(`git clone ${authenticatedUrl} ${repoPath}`);
                execSync(`git config user.name "${userName}"`, { cwd: repoPath });
                execSync(`git config user.email "${userEmail}"`, { cwd: repoPath });
            } else {
                try {
                    execSync(`git fetch origin`, { cwd: repoPath });
                    execSync(`git reset --hard origin/main`, { cwd: repoPath });
                } catch (e) {
                    // Re-clone if corrupt
                    fs.rmSync(repoPath, { recursive: true, force: true });
                    execSync(`git clone ${authenticatedUrl} ${repoPath}`);
                    execSync(`git config user.name "${userName}"`, { cwd: repoPath });
                    execSync(`git config user.email "${userEmail}"`, { cwd: repoPath });
                }
            }

            // --- 2. Remove Folders ---
            // We look for folders starting with appName inside 'apps/'
            // Expected patterns: {appName}-prod, {appName}-testing, {appName}-db-prod, {appName}-db-testing

            const foldersToDelete = [];
            if (fs.existsSync(appsPath)) {
                const files = fs.readdirSync(appsPath);
                files.forEach(file => {
                    // Strict check to ensure we don't delete "inventory-backend" when deleting "inventory"
                    // The folders generated are exactly: appName + "-prod", "-testing", "-db-prod", "-db-testing"
                    if (file === `${appName}-prod` ||
                        file === `${appName}-testing` ||
                        file === `${appName}-db-prod` ||
                        file === `${appName}-db-testing`) {

                        const fullPath = path.join(appsPath, file);
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        foldersToDelete.push(file);
                    }
                });
            }

            // --- 3. Update Registry ---
            let registry = [];
            if (fs.existsSync(registryPath)) {
                try {
                    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                } catch (e) {
                    console.error("Failed to parse registry", e);
                }
            }

            const initialLength = registry.length;
            registry = registry.filter(app => app.id !== appId);

            if (foldersToDelete.length === 0 && registry.length === initialLength) {
                return NextResponse.json({ message: "App not found or already deleted." });
            }

            fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

            // --- 4. Commit & Push ---
            const commitMsg = `chore: delete application ${appName} (ID: ${appId})`;

            execSync(`git add .`, { cwd: repoPath });
            try {
                // Check if there are changes to commit
                const status = execSync(`git status --porcelain`, { cwd: repoPath }).toString();
                if (status.trim()) {
                    execSync(`git commit -m "${commitMsg}"`, { cwd: repoPath });
                    execSync(`git push origin main`, { cwd: repoPath });
                } else {
                    return NextResponse.json({ message: "No changes to commit (already clean)." });
                }
            } catch (e) {
                throw new Error("Git push failed: " + e.message);
            }

            // --- 5. Delete Jenkins Job ---
            let jenkinsMessage = '';
            try {
                const jenkinsResult = await deleteJob(appName);
                if (jenkinsResult.success) {
                    jenkinsMessage = ` | ${jenkinsResult.message}`;
                    console.log(`[Jenkins] ${jenkinsResult.message}`);
                } else {
                    jenkinsMessage = ` | Jenkins: ${jenkinsResult.message}`;
                    console.warn(`[Jenkins] ${jenkinsResult.message}`);
                }
            } catch (jenkinsErr) {
                console.error('[Jenkins] Failed to delete pipeline:', jenkinsErr.message);
                jenkinsMessage = ' | Jenkins job deletion failed (non-blocking)';
            }

            return NextResponse.json({
                message: `Successfully deleted ${appName}${jenkinsMessage}`,
                deletedFolders: foldersToDelete
            });

        } catch (err) {
            console.error(err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    });
}
