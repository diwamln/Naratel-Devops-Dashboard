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
"[project]/fix/Naratel-Devops-Dashboard/src/app/api/jenkins/approve/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/jenkins/approve/route.js
__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/fix/Naratel-Devops-Dashboard/node_modules/next/server.js [app-route] (ecmascript)");
;
async function POST(request) {
    // Terima buildId, jobName, dan action (approve/abort)
    const { buildId, jobName, action } = await request.json();
    const { JENKINS_URL, JENKINS_USER, JENKINS_API_TOKEN } = process.env;
    const auth = Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');
    const headers = {
        'Authorization': `Basic ${auth}`
    };
    if (!buildId || !jobName || !action) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Build ID, Job Name, and Action required'
        }, {
            status: 400
        });
    }
    try {
        console.log(`🔍 Mencari Input ID untuk Job: ${jobName} | Build: #${buildId} | Action: ${action}...`);
        // 1. Cari ID Input Dinamis berdasarkan Job Name spesifik
        const checkRes = await fetch(`${JENKINS_URL}/job/${jobName}/${buildId}/wfapi/pendingInputActions`, {
            headers,
            cache: 'no-store'
        });
        if (!checkRes.ok) throw new Error("Gagal mengambil info Jenkins");
        const actions = await checkRes.json();
        if (!actions || actions.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Build ini sudah tidak menunggu approval.'
            }, {
                status: 400
            });
        }
        const inputId = actions[0].id;
        console.log(`✅ Input ID Ditemukan: ${inputId}`);
        // 2. Tentukan URL berdasarkan action (approve atau abort)
        let actionUrl;
        let actionMessage;
        if (action === 'approve') {
            actionUrl = `${JENKINS_URL}/job/${jobName}/${buildId}/input/${inputId}/proceedEmpty`;
            actionMessage = 'Approved';
        } else if (action === 'abort') {
            actionUrl = `${JENKINS_URL}/job/${jobName}/${buildId}/input/${inputId}/abort`;
            actionMessage = 'Aborted';
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Invalid action. Use "approve" or "abort".'
            }, {
                status: 400
            });
        }
        // 3. Kirim request ke Jenkins
        const actionRes = await fetch(actionUrl, {
            method: 'POST',
            headers
        });
        if (actionRes.ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: `Pipeline ${jobName} #${buildId} ${actionMessage}!`
            });
        } else {
            throw new Error(await actionRes.text());
        }
    } catch (error) {
        console.error("Server Error:", error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5c2f2dde._.js.map