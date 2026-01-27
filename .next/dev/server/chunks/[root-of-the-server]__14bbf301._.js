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
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/fix/Naratel-Devops-Dashboard/src/lib/gitMutex.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gitMutex",
    ()=>gitMutex
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$async$2d$mutex$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/fix/Naratel-Devops-Dashboard/node_modules/async-mutex/index.mjs [app-route] (ecmascript)");
;
const gitMutex = new __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$async$2d$mutex$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Mutex"]();
}),
"[project]/fix/Naratel-Devops-Dashboard/src/lib/jenkins.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Jenkins API Helper Library
 * Provides functions to manage Jenkins Pipeline jobs programmatically
 */ __turbopack_context__.s([
    "createPipelineJob",
    ()=>createPipelineJob,
    "deleteJob",
    ()=>deleteJob,
    "jobExists",
    ()=>jobExists
]);
const JENKINS_URL = process.env.JENKINS_URL;
const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_API_TOKEN = process.env.JENKINS_API_TOKEN;
/**
 * Get Base64 encoded auth header for Jenkins
 */ function getAuthHeader() {
    const credentials = Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');
    return `Basic ${credentials}`;
}
/**
 * Generate Jenkinsfile content from template
 * @param {Object} params - Pipeline parameters
 * @param {string} params.appName - Application name
 * @param {string} params.imageRepo - Docker image repository
 * @param {string} params.gitRepoUrl - Git repository URL for the app source code
 * @param {string} params.webuiUrl - WebUI API base URL
 */ function generateJenkinsfile({ appName, imageRepo, gitRepoUrl, webuiUrl }) {
    return `pipeline {
    agent any

    environment {
        APP_NAME       = "${appName}"
        DOCKER_IMAGE   = "${imageRepo}"
        DOCKER_CRED_ID = "docker-hub"

        // URL WebUI Base
        WEBUI_API      = "${webuiUrl}"
        
        APP_VERSION    = ""
    }

    stages {
        stage('Checkout & Get Version') {
            steps {
                script {
                    checkout scm
                    APP_VERSION = sh(
                        script: "git describe --tags --always --abbrev=0 || echo \${BUILD_NUMBER}",
                        returnStdout: true
                    ).trim()
                    echo "Building Version: \${APP_VERSION}"
                }
            }
        }

        stage('Build & Push Docker') {
            steps {
                script {
                    docker.withRegistry('', "\${DOCKER_CRED_ID}") {
                        def customImage = docker.build("\${DOCKER_IMAGE}:\${APP_VERSION}")
                        customImage.push()
                        customImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy Testing (Ephemeral)') {
            steps {
                script {
                    echo "Triggering WebUI to create Ephemeral Testing Environment..."
                    def response = sh(script: """
                        curl -s -X POST \${WEBUI_API}/api/jenkins/deploy-test \\
                        -H "Content-Type: application/json" \\
                        -d '{"appName": "\${APP_NAME}", "imageTag": "\${APP_VERSION}"}'
                    """, returnStdout: true).trim()

                    echo "WebUI Response: \${response}"

                    if (response.contains('"error"')) {
                        error "Failed to deploy testing env: \${response}"
                    }

                    echo "Waiting for pods to be ready..."
                    sleep 60
                }
            }
        }

        stage('Integration Tests') {
            steps {
                script {
                    echo "Running Tests against Testing Env..."
                }
            }
        }

        stage('Approval for Production') {
            steps {
                script {
                    try {
                        input message: "Testing Done. Approve deploy \${APP_VERSION} to Production?",
                              id: 'ApproveDeploy'
                    } catch (Exception e) {
                        currentBuild.result = 'ABORTED'
                        error "Deployment to Production Cancelled."
                    }
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    echo "Updating Production Image Version..."
                    def response = sh(script: """
                        curl -s -X POST \${WEBUI_API}/api/manifest/update-image \\
                        -H "Content-Type: application/json" \\
                        -d '{"appName": "\${APP_NAME}", "env": "prod", "imageTag": "\${APP_VERSION}"}'
                    """, returnStdout: true).trim()

                    echo "WebUI Response: \${response}"

                    if (response.contains('"error"')) {
                        error "Failed to update production: \${response}"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo "Cleaning up Ephemeral Testing Environment..."
                sh """
                    curl -s -X POST \${WEBUI_API}/api/jenkins/destroy-test \\
                    -H "Content-Type: application/json" \\
                    -d '{"appName": "\${APP_NAME}"}'
                """
                cleanWs()
            }
        }
    }
}`;
}
/**
 * Generate Jenkins Pipeline Job XML config
 */ function generateJobConfigXml({ appName, imageRepo, gitRepoUrl, webuiUrl }) {
    const jenkinsfileContent = generateJenkinsfile({
        appName,
        imageRepo,
        gitRepoUrl,
        webuiUrl
    });
    // Escape XML special characters in Jenkinsfile
    const escapedJenkinsfile = jenkinsfileContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    return `<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <description>CI/CD Pipeline for ${appName} - Auto-generated by Naratel DevOps Dashboard</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers/>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps">
    <scm class="hudson.plugins.git.GitSCM" plugin="git">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>${gitRepoUrl}</url>
          <credentialsId>git-token</credentialsId>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="empty-list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>`;
}
async function jobExists(jobName) {
    if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
        console.warn('[Jenkins] Missing configuration, skipping job check');
        return false;
    }
    try {
        const response = await fetch(`${JENKINS_URL}/job/${encodeURIComponent(jobName)}/api/json`, {
            method: 'GET',
            headers: {
                'Authorization': getAuthHeader()
            }
        });
        return response.ok;
    } catch (error) {
        console.error('[Jenkins] Error checking job:', error.message);
        return false;
    }
}
async function createPipelineJob({ appName, imageRepo, gitRepoUrl }) {
    if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
        console.warn('[Jenkins] Missing configuration, skipping job creation');
        return {
            success: false,
            message: 'Jenkins not configured'
        };
    }
    const jobName = appName;
    const webuiUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    // Check if job already exists
    const exists = await jobExists(jobName);
    if (exists) {
        console.log(`[Jenkins] Job '${jobName}' already exists, skipping creation`);
        return {
            success: true,
            message: `Job '${jobName}' already exists`
        };
    }
    const jobXml = generateJobConfigXml({
        appName,
        imageRepo,
        gitRepoUrl,
        webuiUrl
    });
    try {
        // First, get crumb for CSRF protection
        let crumb = null;
        try {
            const crumbResponse = await fetch(`${JENKINS_URL}/crumbIssuer/api/json`, {
                method: 'GET',
                headers: {
                    'Authorization': getAuthHeader()
                }
            });
            if (crumbResponse.ok) {
                const crumbData = await crumbResponse.json();
                crumb = crumbData;
            }
        } catch (e) {
            console.log('[Jenkins] Crumb issuer not available, proceeding without CSRF token');
        }
        // Create the job
        const headers = {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/xml'
        };
        if (crumb) {
            headers[crumb.crumbRequestField] = crumb.crumb;
        }
        const response = await fetch(`${JENKINS_URL}/createItem?name=${encodeURIComponent(jobName)}`, {
            method: 'POST',
            headers,
            body: jobXml
        });
        if (response.ok) {
            console.log(`[Jenkins] Successfully created job '${jobName}'`);
            return {
                success: true,
                message: `Jenkins job '${jobName}' created successfully`
            };
        } else {
            const errorText = await response.text();
            console.error(`[Jenkins] Failed to create job: ${response.status}`, errorText);
            return {
                success: false,
                message: `Failed to create Jenkins job: ${response.status}`
            };
        }
    } catch (error) {
        console.error('[Jenkins] Error creating job:', error.message);
        return {
            success: false,
            message: `Jenkins error: ${error.message}`
        };
    }
}
async function deleteJob(jobName) {
    if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
        console.warn('[Jenkins] Missing configuration, skipping job deletion');
        return {
            success: false,
            message: 'Jenkins not configured'
        };
    }
    // Check if job exists
    const exists = await jobExists(jobName);
    if (!exists) {
        console.log(`[Jenkins] Job '${jobName}' does not exist, skipping deletion`);
        return {
            success: true,
            message: `Job '${jobName}' does not exist`
        };
    }
    try {
        // Get crumb for CSRF protection
        let crumb = null;
        try {
            const crumbResponse = await fetch(`${JENKINS_URL}/crumbIssuer/api/json`, {
                method: 'GET',
                headers: {
                    'Authorization': getAuthHeader()
                }
            });
            if (crumbResponse.ok) {
                const crumbData = await crumbResponse.json();
                crumb = crumbData;
            }
        } catch (e) {
            console.log('[Jenkins] Crumb issuer not available');
        }
        const headers = {
            'Authorization': getAuthHeader()
        };
        if (crumb) {
            headers[crumb.crumbRequestField] = crumb.crumb;
        }
        const response = await fetch(`${JENKINS_URL}/job/${encodeURIComponent(jobName)}/doDelete`, {
            method: 'POST',
            headers
        });
        if (response.ok || response.status === 302) {
            console.log(`[Jenkins] Successfully deleted job '${jobName}'`);
            return {
                success: true,
                message: `Jenkins job '${jobName}' deleted successfully`
            };
        } else {
            const errorText = await response.text();
            console.error(`[Jenkins] Failed to delete job: ${response.status}`, errorText);
            return {
                success: false,
                message: `Failed to delete Jenkins job: ${response.status}`
            };
        }
    } catch (error) {
        console.error('[Jenkins] Error deleting job:', error.message);
        return {
            success: false,
            message: `Jenkins error: ${error.message}`
        };
    }
}
}),
"[project]/fix/Naratel-Devops-Dashboard/src/app/api/manifest/delete/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/fix/Naratel-Devops-Dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$gitMutex$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/fix/Naratel-Devops-Dashboard/src/lib/gitMutex.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$jenkins$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/fix/Naratel-Devops-Dashboard/src/lib/jenkins.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
const dynamic = 'force-dynamic';
async function POST(req) {
    const { appId, appName } = await req.json();
    if (!appId || !appName) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing appId or appName"
        }, {
            status: 400
        });
    }
    return await __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$gitMutex$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gitMutex"].runExclusive(async ()=>{
        const repoDirName = 'manifest-repo-workdir';
        const repoPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir(), repoDirName);
        const registryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(repoPath, 'registry.json');
        const appsPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(repoPath, 'apps');
        const token = process.env.GITHUB_TOKEN;
        const repoUrl = process.env.MANIFEST_REPO_URL;
        const userName = process.env.GIT_USER_NAME || "Naratel DevOps Dashboard";
        const userEmail = process.env.GIT_USER_EMAIL || "devops@naratel.com";
        if (!repoUrl || !token) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing."
            }, {
                status: 500
            });
        }
        try {
            // --- 1. Git Setup (Clone/Pull) ---
            const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(repoPath)) {
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git clone ${authenticatedUrl} ${repoPath}`);
            } else {
                try {
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git fetch origin`, {
                        cwd: repoPath
                    });
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git reset --hard origin/main`, {
                        cwd: repoPath
                    });
                } catch (e) {
                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(repoPath, {
                        recursive: true,
                        force: true
                    });
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git clone ${authenticatedUrl} ${repoPath}`);
                }
            }
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.name "${userName}"`, {
                cwd: repoPath
            });
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.email "${userEmail}"`, {
                cwd: repoPath
            });
            // --- 2. Remove Folders ---
            const foldersToDelete = [];
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(appsPath)) {
                const files = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(appsPath);
                // Construct search patterns for this app
                const targetPatterns = [
                    `${appName}-prod`,
                    `${appName}-testing`,
                    `${appName}-db-prod`,
                    `${appName}-db-testing`,
                    `${appId}-${appName}-prod`,
                    `${appId}-${appName}-testing`,
                    `${appId}-db-${appName}-prod`,
                    `${appId}-db-${appName}-testing`
                ];
                files.forEach((file)=>{
                    if (targetPatterns.includes(file)) {
                        const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(appsPath, file);
                        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(fullPath, {
                            recursive: true,
                            force: true
                        });
                        foldersToDelete.push(file);
                        console.log(`[DELETE] Removed folder: ${file}`);
                    }
                });
            }
            // --- 3. Update Registry ---
            let registry = [];
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(registryPath)) {
                try {
                    registry = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(registryPath, 'utf8'));
                } catch (e) {
                    console.error("Failed to parse registry", e);
                }
            }
            const initialLength = registry.length;
            registry = registry.filter((app)=>app.id !== appId);
            if (foldersToDelete.length === 0 && registry.length === initialLength) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    message: "App not found or already deleted."
                });
            }
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(registryPath, JSON.stringify(registry, null, 2));
            // --- 4. Commit & Push ---
            const commitMsg = `chore: delete application ${appName} (ID: ${appId})`;
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git add .`, {
                cwd: repoPath
            });
            try {
                // Check if there are changes to commit
                const status = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git status --porcelain`, {
                    cwd: repoPath
                }).toString();
                if (status.trim()) {
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git commit -m "${commitMsg}"`, {
                        cwd: repoPath
                    });
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git push origin main`, {
                        cwd: repoPath
                    });
                } else {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        message: "No changes to commit (already clean)."
                    });
                }
            } catch (e) {
                throw new Error("Git push failed: " + e.message);
            }
            // --- 5. Delete Jenkins Job ---
            let jenkinsMessage = '';
            try {
                const jenkinsResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$jenkins$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteJob"])(appName);
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
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: `Successfully deleted ${appName}${jenkinsMessage}`,
                deletedFolders: foldersToDelete
            });
        } catch (err) {
            console.error(err);
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: err.message
            }, {
                status: 500
            });
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__14bbf301._.js.map