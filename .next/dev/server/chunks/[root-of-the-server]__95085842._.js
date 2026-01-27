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
"[project]/webui-devops/Naratel-Devops-Dashboard/src/lib/gitMutex.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gitMutex",
    ()=>gitMutex
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$async$2d$mutex$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/webui-devops/Naratel-Devops-Dashboard/node_modules/async-mutex/index.mjs [app-route] (ecmascript)");
;
const gitMutex = new __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$async$2d$mutex$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Mutex"]();
}),
"[project]/webui-devops/Naratel-Devops-Dashboard/src/lib/jenkins.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/webui-devops/Naratel-Devops-Dashboard/src/app/api/manifest/generate/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/webui-devops/Naratel-Devops-Dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$gitMutex$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/webui-devops/Naratel-Devops-Dashboard/src/lib/gitMutex.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$jenkins$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/webui-devops/Naratel-Devops-Dashboard/src/lib/jenkins.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
async function POST(req) {
    const data = await req.json();
    const repoDirName = 'manifest-repo-workdir';
    const repoPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir(), repoDirName);
    const registryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(repoPath, 'registry.json');
    const token = process.env.GITHUB_TOKEN;
    const repoUrl = process.env.MANIFEST_REPO_URL;
    const userName = process.env.GIT_USER_NAME || "Naratel DevOps Dashboard";
    const userEmail = process.env.GIT_USER_EMAIL || "devops@naratel.com";
    const ageKey = "age1ywhtcmyuhmfa32kfaaxcak4dvq27q9g6m55gqlzu2vlwkgfj24wq3g4ejx"; // Public Key
    if (!repoUrl || !token) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing."
        }, {
            status: 500
        });
    }
    return await __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$gitMutex$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gitMutex"].runExclusive(async ()=>{
        try {
            // --- 0. Git Setup (Clone/Pull) ---
            const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(repoPath)) {
                console.log(`Cloning repository to ${repoPath}...`);
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git clone ${authenticatedUrl} ${repoPath}`);
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.name "${userName}"`, {
                    cwd: repoPath
                });
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.email "${userEmail}"`, {
                    cwd: repoPath
                });
            } else {
                console.log(`Updating repository at ${repoPath}...`);
                try {
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git fetch origin`, {
                        cwd: repoPath
                    });
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git reset --hard origin/main`, {
                        cwd: repoPath
                    });
                } catch (e) {
                    console.warn("Git pull/reset failed, attempting to re-clone...", e.message);
                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(repoPath, {
                        recursive: true,
                        force: true
                    });
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git clone ${authenticatedUrl} ${repoPath}`);
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.name "${userName}"`, {
                        cwd: repoPath
                    });
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.email "${userEmail}"`, {
                        cwd: repoPath
                    });
                }
            }
        } catch (error) {
            console.error("Git Setup Failed:", error.message);
            return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to initialize git repository: " + error.message
            }, {
                status: 500
            });
        }
        // --- CRITICAL FIX: Race Condition Check ---
        // Read registry freshly pulled from git to verify ID availability
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(registryPath)) {
                const content = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(registryPath, 'utf8');
                const currentRegistry = JSON.parse(content);
                // Check if the requested ID is already taken
                const isTaken = currentRegistry.some((app)=>app.id === data.appId);
                if (isTaken) {
                    console.log(`[CONFLICT] App ID ${data.appId} is already taken. Calculating new ID...`);
                    // Calculate new Max ID
                    let maxId = 0;
                    currentRegistry.forEach((app)=>{
                        const idNum = parseInt(app.id);
                        if (!isNaN(idNum) && idNum > maxId) {
                            maxId = idNum;
                        }
                    });
                    const newId = String(maxId + 1).padStart(3, '0');
                    console.log(`[RESOLVED] Auto-assigning new ID: ${newId}`);
                    data.appId = newId; // Override the ID
                }
            }
        } catch (e) {
            console.warn("Failed to validate App ID collision:", e.message);
        // Continue, worst case it overwrites or fails later
        }
        // ------------------------------------------
        const generatedFolders = [];
        const errors = [];
        let safeImageRepo = data.imageRepo;
        if (safeImageRepo && safeImageRepo.startsWith('dockerio/')) {
            safeImageRepo = safeImageRepo.replace('dockerio/', '');
        }
        // --- Helper: Generate YAML Content (Split Values & Secrets) ---
        const generateYaml = (templateType, env)=>{
            const appName = data.appName;
            const appId = data.appId;
            // --- SECRETS Construction ---
            const appSecretObj = {};
            if (data.appSecrets && Array.isArray(data.appSecrets)) {
                data.appSecrets.forEach((s)=>{
                    let val = s.value;
                    if (env === 'prod' && s.valueProd) val = s.valueProd;
                    if (env === 'testing' && s.valueTest) val = s.valueTest;
                    if (s.key && val !== undefined && val !== null) {
                        appSecretObj[s.key] = val;
                    }
                });
            }
            if (data.dbType !== 'none') {
                const dbPort = data.dbType === 'postgres' ? "5432" : "3306";
                const dbName = data.appName.replace(/-/g, '_');
                // FORCE overwrite DB_HOST and DB_PORT to match the Service we are generating
                // FIX: Using FQDN because DB is in a separate isolated namespace now
                // Format: svc-db-{appName}-{id}.{id}-db-{appName}-{env}.svc.cluster.local
                appSecretObj["DB_HOST"] = `svc-db-${data.appName}-${data.appId}.${data.appId}-db-${data.appName}-${env}.svc.cluster.local`;
                appSecretObj["DB_PORT"] = dbPort;
                // --- Standardize Keys (Map DB_USER -> DB_USERNAME, etc.) ---
                if (appSecretObj["DB_NAME"] && !appSecretObj["DB_DATABASE"]) {
                    appSecretObj["DB_DATABASE"] = appSecretObj["DB_NAME"];
                }
                if (appSecretObj["DB_USER"] && !appSecretObj["DB_USERNAME"]) {
                    appSecretObj["DB_USERNAME"] = appSecretObj["DB_USER"];
                }
                if (appSecretObj["DB_PASS"] && !appSecretObj["DB_PASSWORD"]) {
                    appSecretObj["DB_PASSWORD"] = appSecretObj["DB_PASS"];
                }
                // --- Fill Defaults if still missing ---
                if (!appSecretObj["DB_DATABASE"]) appSecretObj["DB_DATABASE"] = dbName;
                if (!appSecretObj["DB_USERNAME"]) appSecretObj["DB_USERNAME"] = "admin";
                if (!appSecretObj["DB_PASSWORD"]) appSecretObj["DB_PASSWORD"] = "changeme_securely";
            }
            const dbSecretObj = {};
            if (data.dbSecrets && Array.isArray(data.dbSecrets)) {
                data.dbSecrets.forEach((s)=>{
                    let val = s.value;
                    if (env === 'prod' && s.valueProd) val = s.valueProd;
                    if (env === 'testing' && s.valueTest) val = s.valueTest;
                    if (val && typeof val === 'string') val = val.trim();
                    if (s.key && val !== undefined && val !== null) {
                        dbSecretObj[s.key] = val;
                    }
                });
            }
            if (data.dbType !== 'none') {
                const dbName = data.appName.replace(/-/g, '_');
                console.log("[DEBUG] Mapping DB Secrets for type:", data.dbType);
                console.log("[DEBUG] Initial dbSecretObj:", JSON.stringify(dbSecretObj, null, 2));
                if (data.dbType === 'postgres') {
                    // STRICT CLEANUP: Remove any MySQL keys that might have slipped in
                    Object.keys(dbSecretObj).forEach((k)=>{
                        if (k.startsWith('MYSQL_') || k.startsWith('MARIADB_')) delete dbSecretObj[k];
                    });
                    // FORCE: Gunakan Key standar Bitnami PostgreSQL (POSTGRESQL_*)
                    // Prioritaskan input dari dbSecretObj (Form DB Secrets), fallback ke appSecretObj (Form App Secrets)
                    const userDbName = dbSecretObj["POSTGRESQL_DATABASE"] || dbSecretObj["POSTGRES_DB"] || dbSecretObj["DB_NAME"] || appSecretObj["DB_NAME"] || dbName;
                    const userDbUser = dbSecretObj["POSTGRESQL_USERNAME"] || dbSecretObj["POSTGRES_USER"] || dbSecretObj["DB_USER"] || appSecretObj["DB_USER"] || "admin";
                    const userDbPass = dbSecretObj["POSTGRESQL_PASSWORD"] || dbSecretObj["POSTGRES_PASSWORD"] || dbSecretObj["DB_PASS"] || appSecretObj["DB_PASS"] || "changeme_securely";
                    dbSecretObj["POSTGRESQL_DATABASE"] = userDbName;
                    dbSecretObj["POSTGRESQL_USERNAME"] = userDbUser;
                    dbSecretObj["POSTGRESQL_PASSWORD"] = userDbPass;
                    dbSecretObj["POSTGRESQL_POSTGRES_PASSWORD"] = userDbPass; // Set postgres root pass
                    // Cleanup non-standard/old keys
                    delete dbSecretObj["POSTGRES_DB"];
                    delete dbSecretObj["POSTGRES_USER"];
                    delete dbSecretObj["POSTGRES_PASSWORD"];
                    delete dbSecretObj["DB_NAME"];
                    delete dbSecretObj["DB_USER"];
                    delete dbSecretObj["DB_PASS"];
                    delete dbSecretObj["DB_USERNAME"];
                    delete dbSecretObj["DB_PASSWORD"];
                    delete dbSecretObj["DB_DATABASE"];
                } else {
                    // STRICT CLEANUP: Remove any Postgres keys that might have slipped in
                    Object.keys(dbSecretObj).forEach((k)=>{
                        if (k.startsWith('POSTGRES_') || k.startsWith('POSTGRESQL_')) delete dbSecretObj[k];
                    });
                    // FORCE: Gunakan Key standar Bitnami MariaDB (MARIADB_*)
                    const userDbName = dbSecretObj["MARIADB_DATABASE"] || dbSecretObj["MYSQL_DATABASE"] || dbSecretObj["DB_NAME"] || appSecretObj["DB_NAME"] || dbName;
                    const userDbUser = dbSecretObj["MARIADB_USER"] || dbSecretObj["MYSQL_USER"] || dbSecretObj["DB_USER"] || appSecretObj["DB_USER"] || "admin";
                    const userDbPass = dbSecretObj["MARIADB_PASSWORD"] || dbSecretObj["MYSQL_PASSWORD"] || dbSecretObj["DB_PASS"] || appSecretObj["DB_PASS"] || "changeme_securely";
                    dbSecretObj["MARIADB_DATABASE"] = userDbName;
                    dbSecretObj["MARIADB_USER"] = userDbUser;
                    dbSecretObj["MARIADB_PASSWORD"] = userDbPass;
                    dbSecretObj["MARIADB_ROOT_PASSWORD"] = dbSecretObj["MARIADB_ROOT_PASSWORD"] || dbSecretObj["MYSQL_ROOT_PASSWORD"] || "changeme_root";
                    // Cleanup
                    delete dbSecretObj["MYSQL_DATABASE"];
                    delete dbSecretObj["MYSQL_USER"];
                    delete dbSecretObj["MYSQL_PASSWORD"];
                    delete dbSecretObj["MYSQL_ROOT_PASSWORD"];
                    delete dbSecretObj["DB_NAME"];
                    delete dbSecretObj["DB_USER"];
                    delete dbSecretObj["DB_PASS"];
                }
                console.log("[DEBUG] Final dbSecretObj:", JSON.stringify(dbSecretObj, null, 2));
            }
            const formatSecrets = (obj)=>{
                if (Object.keys(obj).length === 0) return '{}';
                return Object.entries(obj).map(([k, v])=>{
                    const safeVal = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\"');
                    return `  ${k}: "${safeVal}"`;
                }).join('\n');
            };
            let values = "";
            let secrets = "";
            // A. APP PRODUCTION
            if (templateType === 'app-prod') {
                secrets = `secretData:\n${formatSecrets(appSecretObj)}`;
                values = `
namespace: prod
controllerType: Deployment

app:
  id: "${appId}"
  name: "${appName}"
  env: "prod"

image:
  repository: "${safeImageRepo}"
  tag: "${data.imageTag}"

service:
  port: ${data.servicePort}
  targetPort: ${data.targetPort}
`.trim();
                if (data.migrationEnabled) {
                    values += `

migration:
  enabled: true
  command: "${data.migrationCommand}"`;
                }
                if (data.dbType !== 'none') {
                    values += `

backup:
  enabled: true
  type: "${data.dbType}"`;
                }
                if (data.ingressEnabled) {
                    values += `

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: "${data.ingressHost}"
      path: /
`;
                    if (data.tlsEnabled) {
                        values += `  tls:
    - secretName: "${appName}-tls"
      hosts:
        - "${data.ingressHost}"`;
                    }
                }
            }
            // B. APP TESTING
            if (templateType === 'app-testing') {
                secrets = `secretData:\n${formatSecrets(appSecretObj)}`;
                values = `
namespace: testing
controllerType: Deployment

app:
  id: "${appId}"
  name: "${appName}"
  env: "testing"

image:
  repository: "${data.imageRepo}"
  tag: "${data.imageTag}"

service:
  type: NodePort
  port: ${data.servicePort}
  targetPort: ${data.targetPort}
`.trim();
                if (data.migrationEnabled) {
                    values += `

migration:
  enabled: true
  command: "${data.migrationCommand}"`;
                }
                if (data.dbType !== 'none') {
                    values += `

backup:
  enabled: true
  type: "${data.dbType}"`;
                }
                if (data.ingressEnabled) {
                    values += `

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: "test-${data.ingressHost}"
      path: /
`;
                }
            }
            // C. DB PRODUCTION
            if (templateType === 'db-prod') {
                const dbImage = data.dbType === 'postgres' ? 'devopsnaratel/postgresql' : 'devopsnaratel/mariadb';
                const dbTag = data.dbType === 'postgres' ? '18.1' : '12.1.2';
                const dbPort = data.dbType === 'postgres' ? 5432 : 3306;
                secrets = `secretData:\n${formatSecrets(dbSecretObj)}`;
                values = `
namespace: prod
controllerType: StatefulSet

app:
  id: "${appId}"
  name: "db-${appName}"
  env: "prod"

image:
  repository: "${dbImage}"
  tag: "${dbTag}"

service:
  port: ${dbPort}
  targetPort: ${dbPort}

backup:
  enabled: true
  type: "${data.dbType}"
`.trim();
            }
            // D. DB TESTING
            if (templateType === 'db-testing') {
                const dbImage = data.dbType === 'postgres' ? 'devopsnaratel/postgresql' : 'devopsnaratel/mariadb';
                const dbTag = data.dbType === 'postgres' ? '18.1' : '12.1.2';
                const dbPort = data.dbType === 'postgres' ? 5432 : 3306;
                secrets = `secretData:\n${formatSecrets(dbSecretObj)}`;
                values = `
namespace: testing
controllerType: StatefulSet

app:
  id: "${appId}"
  name: "${appName}-db"
  env: "testing"

image:
  repository: "${dbImage}"
  tag: "${dbTag}"

service:
  port: ${dbPort}
  targetPort: ${dbPort}

backup:
  enabled: true
  type: "${data.dbType}"
`.trim();
            }
            return {
                values,
                secrets,
                appSecretObj,
                dbSecretObj
            };
        };
        // --- Helper: Write & Encrypt ---
        const processManifest = (folderName, type, env)=>{
            const targetFolder = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(repoPath, 'apps', folderName);
            const valuesPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(targetFolder, 'values.yaml');
            const secretsPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(targetFolder, 'secrets.yaml');
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(targetFolder)) {
                console.log(`Folder ${folderName} exists, updating...`);
            } else {
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(targetFolder, {
                    recursive: true
                });
            }
            const { values, secrets, appSecretObj, dbSecretObj } = generateYaml(type, env);
            // DEBUG: Log the secrets being generated to verify values (Keys only for safety)
            console.log(`[DEBUG] Generating ${folderName} (${env}):`);
            if (type.startsWith('app')) {
                console.log("App Secret Keys:", Object.keys(appSecretObj));
            } else {
                console.log("DB Secret Keys:", Object.keys(dbSecretObj));
            }
            // 1. Write Plaintext Values
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(valuesPath, values);
            // 2. Write Secrets
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(secretsPath, secrets);
            // 3. Encrypt Secrets ONLY
            try {
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`sops --encrypt --age ${ageKey} --encrypted-regex '^(secretData)$' --in-place ${secretsPath}`, {
                    cwd: repoPath
                });
                generatedFolders.push(folderName);
            } catch (e) {
                console.error(`Encryption failed for ${folderName}`, e);
                errors.push(`Encryption failed for ${folderName}: ${e.message}`);
            }
        };
        try {
            // GENERATE PROD ONLY (Testing is now Ephemeral/On-Demand via Jenkins)
            processManifest(`${data.appName}-prod`, 'app-prod', 'prod');
            if (data.dbType !== 'none') {
                processManifest(`${data.appName}-db-prod`, 'db-prod', 'prod');
            }
            // Update Registry
            try {
                let registry = [];
                if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(registryPath)) {
                    const content = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(registryPath, 'utf8');
                    try {
                        registry = JSON.parse(content);
                    } catch (e) {
                        registry = [];
                    }
                }
                const existingIdx = registry.findIndex((r)=>r.id === data.appId);
                const newEntry = {
                    id: data.appId,
                    name: data.appName,
                    image: `${safeImageRepo}:${data.imageTag}`,
                    db: data.dbType,
                    ingressHost: data.ingressEnabled ? data.ingressHost : null,
                    gitRepoUrl: data.gitRepoUrl || null,
                    createdAt: new Date().toISOString()
                };
                if (existingIdx >= 0) {
                    registry[existingIdx] = newEntry;
                } else {
                    registry.push(newEntry);
                }
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(registryPath, JSON.stringify(registry, null, 2));
            } catch (regError) {
                errors.push("Failed to update registry.json: " + regError.message);
            }
            if (errors.length > 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: errors.join(', '),
                    generated: generatedFolders
                }, {
                    status: 400
                });
            }
            // Commit & Push
            const commitMsg = `feat: add/update manifests for ${data.appName} (split structure)`;
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git add .`, {
                cwd: repoPath
            });
            try {
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git commit -m "${commitMsg}"`, {
                    cwd: repoPath
                });
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git push origin main`, {
                    cwd: repoPath
                });
            } catch (e) {
                if (e.message.includes('nothing to commit')) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        message: "No changes detected."
                    });
                }
                throw e;
            }
            // Create Jenkins Pipeline Job (if gitRepoUrl provided)
            let jenkinsMessage = '';
            if (data.gitRepoUrl) {
                try {
                    const jenkinsResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$jenkins$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createPipelineJob"])({
                        appName: data.appName,
                        imageRepo: safeImageRepo,
                        gitRepoUrl: data.gitRepoUrl
                    });
                    if (jenkinsResult.success) {
                        jenkinsMessage = ` | ${jenkinsResult.message}`;
                        console.log(`[Jenkins] ${jenkinsResult.message}`);
                    } else {
                        jenkinsMessage = ` | Jenkins: ${jenkinsResult.message}`;
                        console.warn(`[Jenkins] ${jenkinsResult.message}`);
                    }
                } catch (jenkinsErr) {
                    console.error('[Jenkins] Failed to create pipeline:', jenkinsErr.message);
                    jenkinsMessage = ' | Jenkins pipeline creation failed (non-blocking)';
                }
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: `Success! Generated ${generatedFolders.join(', ')}${jenkinsMessage}`,
                folders: generatedFolders
            });
        } catch (err) {
            console.error(err);
            return __TURBOPACK__imported__module__$5b$project$5d2f$webui$2d$devops$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: err.message
            }, {
                status: 500
            });
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__95085842._.js.map