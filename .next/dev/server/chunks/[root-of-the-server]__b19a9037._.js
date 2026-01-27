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
"[project]/fix/Naratel-Devops-Dashboard/src/app/api/manifest/generate/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing."
        }, {
            status: 500
        });
    }
    return await __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$gitMutex$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gitMutex"].runExclusive(async ()=>{
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
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to initialize git repository: " + error.message
            }, {
                status: 500
            });
        }
        // --- Race Condition Check ---
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(registryPath)) {
                const content = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(registryPath, 'utf8');
                const currentRegistry = JSON.parse(content);
                const isTaken = currentRegistry.some((app)=>app.id === data.appId);
                if (isTaken) {
                    let maxId = 0;
                    currentRegistry.forEach((app)=>{
                        const idNum = parseInt(app.id);
                        if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
                    });
                    data.appId = String(maxId + 1).padStart(3, '0');
                }
            // Domain Logic (Optional for Prod creation, usually for Test)
            // We leave domain allocation for deploy-test route mostly.
            }
        } catch (e) {
            console.warn("Failed to validate App ID collision:", e.message);
        }
        const generatedFolders = [];
        const errors = [];
        let safeImageRepo = data.imageRepo;
        if (safeImageRepo && safeImageRepo.startsWith('dockerio/')) {
            safeImageRepo = safeImageRepo.replace('dockerio/', '');
        }
        // --- Helper: Parse Secrets ---
        const parseSecrets = (list)=>{
            const obj = {};
            if (Array.isArray(list)) {
                list.forEach((s)=>{
                    if (s.key && s.value !== undefined) obj[s.key] = s.value;
                });
            }
            return obj;
        };
        // Prepare Secret Objects
        const appSecretsProd = parseSecrets(data.appSecrets);
        // Note: Frontend should send appSecretsTest if it wants to pre-provision test secrets
        const appSecretsTest = parseSecrets(data.appSecretsTest || []);
        const dbSecretsProd = parseSecrets(data.dbSecrets);
        const dbSecretsTest = parseSecrets(data.dbSecretsTest || []);
        // --- DB Key Standardization ---
        const standardizeDbSecrets = (secretObj, type, appName, env)=>{
            const dbName = appName.replace(/-/g, '_') + (env === 'testing' ? '_testing' : '');
            if (type === 'postgres') {
                Object.keys(secretObj).forEach((k)=>{
                    if (k.startsWith('MYSQL_') || k.startsWith('MARIADB_')) delete secretObj[k];
                });
                secretObj["POSTGRESQL_DATABASE"] = secretObj["POSTGRESQL_DATABASE"] || secretObj["POSTGRES_DB"] || secretObj["DB_NAME"] || dbName;
                secretObj["POSTGRESQL_USERNAME"] = secretObj["POSTGRESQL_USERNAME"] || secretObj["POSTGRES_USER"] || secretObj["DB_USER"] || "postgres";
                secretObj["POSTGRESQL_PASSWORD"] = secretObj["POSTGRESQL_PASSWORD"] || secretObj["POSTGRES_PASSWORD"] || secretObj["DB_PASS"] || "changeme_securely";
                secretObj["POSTGRESQL_POSTGRES_PASSWORD"] = secretObj["POSTGRESQL_PASSWORD"];
                delete secretObj["POSTGRES_DB"];
                delete secretObj["POSTGRES_USER"];
                delete secretObj["POSTGRES_PASSWORD"];
                delete secretObj["DB_NAME"];
                delete secretObj["DB_USER"];
                delete secretObj["DB_PASS"];
            } else {
                Object.keys(secretObj).forEach((k)=>{
                    if (k.startsWith('POSTGRES_') || k.startsWith('POSTGRESQL_')) delete secretObj[k];
                });
                secretObj["MARIADB_DATABASE"] = secretObj["MARIADB_DATABASE"] || secretObj["MYSQL_DATABASE"] || secretObj["DB_NAME"] || dbName;
                secretObj["MARIADB_USER"] = secretObj["MARIADB_USER"] || secretObj["MYSQL_USER"] || secretObj["DB_USER"] || "app_user";
                secretObj["MARIADB_PASSWORD"] = secretObj["MARIADB_PASSWORD"] || secretObj["MYSQL_PASSWORD"] || secretObj["DB_PASS"] || "changeme_securely";
                secretObj["MARIADB_ROOT_PASSWORD"] = secretObj["MARIADB_ROOT_PASSWORD"] || secretObj["MYSQL_ROOT_PASSWORD"] || "changeme_root";
                delete secretObj["MYSQL_DATABASE"];
                delete secretObj["MYSQL_USER"];
                delete secretObj["MYSQL_PASSWORD"];
                delete secretObj["MYSQL_ROOT_PASSWORD"];
                delete secretObj["DB_NAME"];
                delete secretObj["DB_USER"];
                delete secretObj["DB_PASS"];
            }
            return secretObj;
        };
        if (data.dbType !== 'none') {
            standardizeDbSecrets(dbSecretsProd, data.dbType, data.appName, 'prod');
            if (Object.keys(dbSecretsTest).length > 0) {
                standardizeDbSecrets(dbSecretsTest, data.dbType, data.appName, 'testing');
            }
        }
        // --- Helper: Format Secrets to YAML ---
        const formatSecrets = (obj)=>{
            if (Object.keys(obj).length === 0) return '{}';
            return Object.entries(obj).map(([k, v])=>{
                const safeVal = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                return `  ${k}: "${safeVal}"`;
            }).join('\n');
        };
        // --- Generator Logic ---
        const generateYaml = (templateType, env, secretsObj)=>{
            const appName = data.appName;
            const appId = data.appId;
            let values = "";
            let secrets = `secretData:\n${formatSecrets(secretsObj)}`;
            // Inject DB Connection for App
            if (templateType.startsWith('app') && data.dbType !== 'none') {
                const dbPort = data.dbType === 'postgres' ? "5432" : "3306";
                // Prod: svc-db-APP-ID.ID-db-APP-prod...
                // Test: svc-db-APP-ID.ID-db-APP-testing...
                const nsSuffix = env === 'prod' ? 'prod' : 'testing';
            // Note: We don't inject into secretsObj here because secretsObj is passed in.
            // But we should ensure the app knows where to connect.
            // Usually this is done via secrets or env vars. 
            // Since this is initial generation, users usually put connection details in the secrets form.
            // We can Auto-Inject them into the secretsObj if they are missing?
            // For simplicity, we assume user/frontend populated the secrets OR we rely on standard vars.
            // Actually, let's inject DB_HOST into values.extraEnv if not present, to be safe.
            // But wait, secrets are preferred.
            }
            if (templateType === 'app-prod') {
                values = `
namespace: "${appId}-${appName}-prod"
controllerType: Deployment
app:
  id: "${appId}"
  name: "${appName}"
  env: "prod"
image:
  repository: "${safeImageRepo}"
  tag: "${data.imageTag}"
imagePullSecrets:
  - name: "dockerhub-auth"
service:
  port: ${data.servicePort}
  targetPort: ${data.targetPort}
`.trim();
                if (data.migrationEnabled) {
                    const checkImage = data.dbType === 'postgres' ? 'devopsnaratel/postgresql:18.1' : 'devopsnaratel/mariadb:12.1.2';
                    values += `
migration:
  enabled: true
  command: "${data.migrationCommand}"
  checkImage: "${checkImage}"`;
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
            if (templateType === 'db-prod') {
                const dbType = data.dbType;
                const dbImage = dbType === 'postgres' ? 'devopsnaratel/postgresql' : 'devopsnaratel/mariadb';
                const dbTag = dbType === 'postgres' ? '18.1' : '12.1.2';
                let dbSpecificConfig = '';
                if (dbType === 'mariadb') {
                    dbSpecificConfig = `
mariadb:
  image:
    repository: "${dbImage}"
    tag: "${dbTag}"
  backup:
    schedule: "0 1 * * *"
  restore:
    enabled: "false"
    s3Path: ""
    sourceNamespace: ""`;
                } else {
                    dbSpecificConfig = `
postgres:
  image:
    repository: "${dbImage}"
    tag: "${dbTag}"
  backup:
    schedule: "0 1 * * *"
  restore:
    enabled: "false"
    s3Path: ""
    sourceNamespace: ""`;
                }
                values = `
# Generated by Naratel Dashboard - Enterprise Database Manifest
namespace: "${appId}-db-${appName}-prod"
fullnameOverride: "sts-db-${appName}-${appId}"
databaseType: "${dbType}"

s3:
  endpoint: "http://10.246.2.154:8010"
  bucket: "${dbType === 'postgres' ? 'postgres-wal-archive' : 'mariadb-wal-archive'}"
  region: "us-east-1"

storage:
  className: "${data.storageClass || 'longhorn'}"
  size: "10Gi"

imagePullSecrets:
  - name: "dockerhub-auth"

serviceAccount:
  create: true
  name: "sa-db-${appName}"

${dbSpecificConfig.trim()}

podAnnotations:
  app.kubernetes.io/id: "${appId}"
  app.kubernetes.io/env: "prod"
  backup.naratel.com/enabled: "true"
`.trim();
            }
            return {
                values,
                secrets
            };
        };
        // --- Helper: Write & Encrypt ---
        const processManifest = (folderName, type, env, secretObj)=>{
            const targetFolder = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(repoPath, 'apps', folderName);
            const valuesPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(targetFolder, 'values.yaml');
            const secretsPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(targetFolder, 'secrets.yaml');
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(targetFolder)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(targetFolder, {
                recursive: true
            });
            const { values, secrets } = generateYaml(type, env, secretObj);
            // Write Values
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(valuesPath, values);
            // Write Secrets
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(secretsPath, secrets);
            // Encrypt Secrets
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
        // --- Helper: Generate Secret File ONLY (For Testing Standby) ---
        const generateSecretFile = (folderName, secretObj)=>{
            const targetFolder = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(repoPath, 'apps', folderName);
            const secretsPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(targetFolder, 'secrets.yaml');
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(targetFolder)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(targetFolder, {
                recursive: true
            });
            const secrets = `secretData:\n${formatSecrets(secretObj)}`;
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(secretsPath, secrets);
            try {
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`sops --encrypt --age ${ageKey} --encrypted-regex '^(secretData)$' --in-place ${secretsPath}`, {
                    cwd: repoPath
                });
                console.log(`[Secrets] Generated standby secrets for ${folderName}`);
            } catch (e) {
                console.error(`Encryption failed for ${folderName}`, e);
            }
        };
        try {
            // 1. Generate PROD Manifests (Values + Secrets)
            processManifest(`${data.appId}-${data.appName}-prod`, 'app-prod', 'prod', appSecretsProd);
            if (data.dbType !== 'none') {
                processManifest(`${data.appId}-db-${data.appName}-prod`, 'db-prod', 'prod', dbSecretsProd);
            }
            // 2. Generate TESTING Secrets (Standby) - Only if provided
            if (Object.keys(appSecretsTest).length > 0) {
                generateSecretFile(`${data.appId}-${data.appName}-testing`, appSecretsTest);
            }
            if (data.dbType !== 'none' && Object.keys(dbSecretsTest).length > 0) {
                generateSecretFile(`${data.appId}-db-${data.appName}-testing`, dbSecretsTest);
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
                    // Preserve testDomain if exists
                    if (registry[existingIdx].testDomain) newEntry.testDomain = registry[existingIdx].testDomain;
                    registry[existingIdx] = newEntry;
                } else {
                    registry.push(newEntry);
                }
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(registryPath, JSON.stringify(registry, null, 2));
            } catch (regError) {
                errors.push("Failed to update registry.json: " + regError.message);
            }
            if (errors.length > 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: errors.join(', '),
                    generated: generatedFolders
                }, {
                    status: 400
                });
            }
            // Commit & Push
            const commitMsg = `feat: add/update manifests for ${data.appName} (split structure + testing secrets)`;
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
                    return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        message: "No changes detected."
                    });
                }
                throw e;
            }
            // Jenkins... (Keep existing)
            let jenkinsMessage = '';
            if (data.gitRepoUrl) {
                try {
                    const jenkinsResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$src$2f$lib$2f$jenkins$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createPipelineJob"])({
                        appName: data.appName,
                        imageRepo: safeImageRepo,
                        gitRepoUrl: data.gitRepoUrl
                    });
                    if (jenkinsResult.success) {
                        jenkinsMessage = ` | ${jenkinsResult.message}`;
                    }
                } catch (jenkinsErr) {
                    console.error('[Jenkins] Failed to create pipeline:', jenkinsErr.message);
                }
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$fix$2f$Naratel$2d$Devops$2d$Dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: `Success! Generated ${generatedFolders.join(', ')}${jenkinsMessage}`,
                folders: generatedFolders
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

//# sourceMappingURL=%5Broot-of-the-server%5D__b19a9037._.js.map