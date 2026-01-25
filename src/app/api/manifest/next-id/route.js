import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import { gitMutex } from '@/lib/gitMutex';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('--- GET /api/manifest/next-id ---');
  return await gitMutex.runExclusive(async () => {
      const repoDirName = 'manifest-repo-workdir';
      const repoPath = path.join(os.tmpdir(), repoDirName);
      const registryPath = path.join(repoPath, 'registry.json');
      
      const token = process.env.GITHUB_TOKEN;
      const repoUrl = process.env.MANIFEST_REPO_URL;
      
      console.log(`Token: ${token ? 'Loaded' : 'Missing'}`);
      console.log(`Repo URL: ${repoUrl || 'Missing'}`);

      // Default jika repo belum ada
      if (!repoUrl || !token) {
        console.log('Missing repoUrl or token, returning default.');
        return NextResponse.json({ nextId: "001", registry: [] }); // Kembalikan registry kosong
      }

      try {
        // 1. Setup Git (Clone/Pull) untuk memastikan data terbaru
        const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);

        if (!fs.existsSync(repoPath)) {
            console.log(`Cloning repo to ${repoPath}`);
            execSync(`git clone ${authenticatedUrl} ${repoPath}`);
        } else {
            console.log(`Fetching and resetting repo at ${repoPath}`);
            try {
              execSync(`git fetch origin`, { cwd: repoPath });
              execSync(`git reset --hard origin/main`, { cwd: repoPath });
            } catch (e) {
              console.warn('Git reset failed, re-cloning.', e.message);
              fs.rmSync(repoPath, { recursive: true, force: true });
              execSync(`git clone ${authenticatedUrl} ${repoPath}`);
            }
        }
        console.log('Git operations successful.');

        // 2. Baca registry.json
        let registry = [];
        if (fs.existsSync(registryPath)) {
            const content = fs.readFileSync(registryPath, 'utf8');
            console.log('registry.json content:', content);
            try {
              registry = JSON.parse(content);
              if (!Array.isArray(registry)) {
                console.error('ERROR: registry.json is not an array!');
                registry = [];
              }
            } catch (e) {
              console.error('ERROR: Failed to parse registry.json!', e);
              registry = [];
            }
        } else {
          console.warn('WARN: registry.json not found!');
        }

        console.log(`Found ${registry.length} apps in registry.`);

        // 3. Enrich Registry with Real Ingress Data
        const enrichedRegistry = registry.map((app, index) => {
            if (!app || typeof app !== 'object') {
              console.warn(`Item at index ${index} is not a valid object, skipping.`);
              return null; // Akan difilter nanti
            }
            if (!app.name) {
              console.warn(`App at index ${index} is missing a 'name', skipping.`, app);
              return null;
            }

            const prodValuesPath = path.join(repoPath, 'apps', `${app.name}-prod`, 'values.yaml');
            const testValuesPath = path.join(repoPath, 'apps', `${app.name}-testing`, 'values.yaml');
            
            let prodHost = null;
            let testHost = null;

            // Read Prod
            if (fs.existsSync(prodValuesPath)) {
                try {
                    const doc = yaml.load(fs.readFileSync(prodValuesPath, 'utf8'));
                    if (doc.ingress && doc.ingress.enabled && doc.ingress.hosts && doc.ingress.hosts.length > 0) {
                        prodHost = doc.ingress.hosts[0].host;
                    }
                } catch (e) { console.warn(`Failed to read prod values for ${app.name}`, e.message); }
            }

            // Read Testing
            if (fs.existsSync(testValuesPath)) {
                try {
                    const doc = yaml.load(fs.readFileSync(testValuesPath, 'utf8'));
                    if (doc.ingress && doc.ingress.enabled && doc.ingress.hosts && doc.ingress.hosts.length > 0) {
                        testHost = doc.ingress.hosts[0].host;
                    }
                } catch (e) { console.warn(`Failed to read test values for ${app.name}`, e.message); }
            }

            return {
                ...app,
                liveIngressProd: prodHost,
                liveIngressTest: testHost
            };
        }).filter(Boolean); // Hapus semua item null

        console.log(`Enriched ${enrichedRegistry.length} apps successfully.`);

        // 4. Cari ID Maksimal
        let maxId = 0;
        enrichedRegistry.forEach(app => {
            const idNum = parseInt(app.id);
            if (!isNaN(idNum) && idNum > maxId) {
                maxId = idNum;
            }
        });

        const nextId = String(maxId + 1).padStart(3, '0');
        console.log(`Calculated nextId: ${nextId}`);
        
        return NextResponse.json({ nextId, registry: enrichedRegistry });

      } catch (error) {
        console.error("FATAL: Unhandled error in next-id:", error);
        // Fallback jika gagal parah
        return NextResponse.json(
          { nextId: "001", registry: [], error: error.message },
          { status: 500 }
        );
      }
  });
}