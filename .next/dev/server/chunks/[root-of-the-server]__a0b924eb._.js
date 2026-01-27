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
"[project]/webui-devops/Naratel-Devops-Dashboard/src/lib/argocd.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/argocd.js
// Cache token in memory to avoid frequent logins
__turbopack_context__.s([
    "getArgoAppStatus",
    ()=>getArgoAppStatus
]);
let cachedToken = null;
let tokenExpiry = 0;
/**
 * Mendapatkan Authentication Token dari ArgoCD
 */ async function getAuthToken() {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) {
        return cachedToken;
    }
    const baseUrl = process.env.ARGOCD_URL?.replace(/\/$/, '');
    const password = process.env.ARGOCD_ADMIN_PASSWORD;
    const username = process.env.ARGOCD_USERNAME || 'admin';
    if (!baseUrl || !password) {
        console.error("[ArgoCD] Missing configuration");
        return null;
    }
    try {
        console.log(`[ArgoCD] Attempting login to ${baseUrl}...`);
        const res = await fetch(`${baseUrl}/api/v1/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            }),
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) {
            const errBody = await res.text();
            console.error(`[ArgoCD] Auth failed (${res.status}): ${errBody}`);
            return null;
        }
        const data = await res.json();
        cachedToken = data.token;
        tokenExpiry = now + 60 * 60 * 1000;
        console.log("[ArgoCD] Login successful, token cached.");
        return cachedToken;
    } catch (error) {
        console.error("[ArgoCD] Connection Error:", error.message);
        return null;
    }
}
async function getArgoAppStatus(appName) {
    const token = await getAuthToken();
    const baseUrl = process.env.ARGOCD_URL?.replace(/\/$/, '');
    if (!token) return {
        error: "Authentication failed. Check logs."
    };
    try {
        const res = await fetch(`${baseUrl}/api/v1/applications/${appName}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            next: {
                revalidate: 0
            }
        });
        if (res.status === 404) {
            return {
                status: 'NotFound',
                error: `Application ${appName} not found in ArgoCD`
            };
        }
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`ArgoCD API Error (${res.status}): ${errText}`);
        }
        const data = await res.json();
        return {
            health: data.status?.health?.status || 'Unknown',
            sync: data.status?.sync?.status || 'Unknown',
            operation: data.status?.operationState?.phase || null,
            conditions: data.status?.conditions || []
        };
    } catch (error) {
        console.error(`[ArgoCD] Fetch Error for ${appName}:`, error.message);
        return {
            error: error.message
        };
    }
}
}),
"[project]/webui-devops/Naratel-Devops-Dashboard/src/app/api/manifest/argo-status/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/webui-devops/Naratel-Devops-Dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$argocd$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/webui-devops/Naratel-Devops-Dashboard/src/lib/argocd.js [app-route] (ecmascript)");
;
;
const dynamic = 'force-dynamic'; // Disable caching
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const appName = searchParams.get('appName');
    if (!appName) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'App Name is required'
        }, {
            status: 400
        });
    }
    // Jika env variable belum diset, return mock data untuk development agar UI tidak rusak
    if (!process.env.ARGOCD_URL) {
        // Mock random delay response
        return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            health: 'MissingConfig',
            sync: 'Unknown'
        });
    }
    try {
        const status = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$argocd$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArgoAppStatus"])(appName);
        return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(status);
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a0b924eb._.js.map