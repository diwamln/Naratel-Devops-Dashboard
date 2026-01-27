module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/fix/Naratel-Devops-Dashboard/src/app/api/jenkins/pending/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/fix/Naratel-Devops-Dashboard/node_modules/next/server.js [app-route] (ecmascript)");
;
async function GET() {
    const { JENKINS_URL, JENKINS_USER, JENKINS_API_TOKEN } = process.env;
    if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Konfigurasi Jenkins tidak lengkap di ENV'
        }, {
            status: 500
        });
    }
    const auth = Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');
    try {
        // 1. Fetch daftar semua jobs dari Jenkins (Optimized dengan tree)
        // Kita hanya mengambil job yang sedang building/running untuk mengurangi request ke API
        const jobsResponse = await fetch(`${JENKINS_URL}/api/json?tree=jobs[name,url,color,lastBuild[building]]`, {
            headers: {
                'Authorization': `Basic ${auth}`
            },
            cache: 'no-store'
        });
        if (!jobsResponse.ok) {
            throw new Error(`Gagal fetch daftar jobs: ${jobsResponse.statusText}`);
        }
        const jenkinsData = await jobsResponse.json();
        const allJobs = jenkinsData.jobs || [];
        if (allJobs.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Tidak ada job ditemukan di Jenkins'
            });
        }
        // 2. Filter hanya job yang sedang aktif (Running/Building)
        const activeJobs = allJobs.filter((job)=>{
            // Cek apakah lastBuild sedang building atau color punya animasi (indikator running)
            const isBuilding = job.lastBuild?.building === true;
            const isAnime = job.color?.toString().endsWith('_anime');
            return isBuilding || isAnime;
        });
        // Extract nama job dari active jobs
        const jobNames = activeJobs.map((job)=>job.name);
        console.log(`Optimization: Processing ${jobNames.length} active jobs out of ${allJobs.length} total jobs.`);
        if (jobNames.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                totalJobs: allJobs.length,
                activeJobs: 0,
                pendingBuilds: 0,
                data: []
            });
        }
        // 3. Fetch data dari ACTIVE job secara Paralel (Promise.all)
        const promises = jobNames.map(async (jobName)=>{
            try {
                const res = await fetch(`${JENKINS_URL}/job/${jobName}/wfapi/runs`, {
                    headers: {
                        'Authorization': `Basic ${auth}`
                    },
                    cache: 'no-store'
                });
                if (!res.ok) {
                    console.log(`Job ${jobName}: HTTP ${res.status}`);
                    return [];
                }
                const runs = await res.json();
                console.log(`Job ${jobName}: ${runs.length} runs ditemukan`);
                // Filter pending runs
                const pendingRuns = runs.filter((run)=>{
                    console.log(`  - Run ${run.id}: status = ${run.status}`);
                    return run.status === 'PAUSED_PENDING_INPUT';
                });
                if (pendingRuns.length > 0) {
                    console.log(`Job ${jobName}: ${pendingRuns.length} pending approval ditemukan!`);
                }
                // Map & Fetch Details (Parameters) secara paralel
                const pending = await Promise.all(pendingRuns.map(async (run)=>{
                    let tag = null;
                    try {
                        const detailsRes = await fetch(`${JENKINS_URL}/job/${jobName}/${run.id}/api/json?tree=actions[parameters[name,value]]`, {
                            headers: {
                                'Authorization': `Basic ${auth}`
                            },
                            cache: 'no-store'
                        });
                        if (detailsRes.ok) {
                            const details = await detailsRes.json();
                            // Collect all parameters from all actions
                            let allParams = [];
                            const actions = details.actions || [];
                            actions.forEach((action)=>{
                                if (action.parameters && Array.isArray(action.parameters)) {
                                    allParams = [
                                        ...allParams,
                                        ...action.parameters
                                    ];
                                }
                            });
                            console.log(`[DEBUG] Job ${jobName} #${run.id} Params:`, JSON.stringify(allParams.map((p)=>`${p.name}=${p.value}`)));
                            // Case-insensitive search for Tag/Version
                            const tagParam = allParams.find((p)=>{
                                const name = p.name.toUpperCase();
                                return [
                                    'TAG',
                                    'IMAGE_TAG',
                                    'VERSION',
                                    'DOCKER_TAG',
                                    'RELEASE_TAG',
                                    'BUILD_TAG'
                                ].includes(name);
                            });
                            if (tagParam) {
                                tag = tagParam.value;
                                console.log(`[DEBUG] Found Tag: ${tag}`);
                            }
                        }
                    } catch (e) {
                        console.warn(`Gagal fetch parameters untuk ${jobName} #${run.id}:`, e.message);
                    }
                    return {
                        id: run.id,
                        name: run.name,
                        status: run.status,
                        timestamp: run.startTimeMillis,
                        jobName: jobName,
                        tag: tag
                    };
                }));
                return pending;
            } catch (err) {
                console.error(`Gagal fetch job ${jobName}:`, err.message);
                return [];
            }
        });
        // Tunggu semua request selesai
        const results = await Promise.all(promises);
        // 4. Gabungkan array of arrays menjadi satu array flat (single list)
        const allPendingBuilds = results.flat();
        // Urutkan berdasarkan waktu (terbaru diatas)
        allPendingBuilds.sort((a, b)=>b.timestamp - a.timestamp);
        console.log('Total pending builds:', allPendingBuilds.length);
        return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            totalJobs: allJobs.length,
            activeJobs: jobNames.length,
            pendingBuilds: allPendingBuilds.length,
            data: allPendingBuilds
        });
    } catch (error) {
        console.error('Error utama:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fa5fe52d._.js.map