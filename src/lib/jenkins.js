/**
 * Jenkins API Helper Library
 * Provides functions to manage Jenkins Pipeline jobs programmatically
 */

const JENKINS_URL = process.env.JENKINS_URL;
const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_API_TOKEN = process.env.JENKINS_API_TOKEN;

/**
 * Get Base64 encoded auth header for Jenkins
 */
function getAuthHeader() {
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
 */
function generateJenkinsfile({ appName, imageRepo, gitRepoUrl, webuiUrl }) {
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
 */
function generateJobConfigXml({ appName, imageRepo, gitRepoUrl, webuiUrl }) {
    const jenkinsfileContent = generateJenkinsfile({ appName, imageRepo, gitRepoUrl, webuiUrl });

    // Escape XML special characters in Jenkinsfile
    const escapedJenkinsfile = jenkinsfileContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

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

/**
 * Check if a Jenkins job exists
 * @param {string} jobName - Name of the job to check
 * @returns {Promise<boolean>}
 */
export async function jobExists(jobName) {
    if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
        console.warn('[Jenkins] Missing configuration, skipping job check');
        return false;
    }

    try {
        const response = await fetch(`${JENKINS_URL}/job/${encodeURIComponent(jobName)}/api/json`, {
            method: 'GET',
            headers: {
                'Authorization': getAuthHeader(),
            },
        });
        return response.ok;
    } catch (error) {
        console.error('[Jenkins] Error checking job:', error.message);
        return false;
    }
}

/**
 * Create a new Jenkins Pipeline job
 * @param {Object} params - Job parameters
 * @param {string} params.appName - Application name (used as job name)
 * @param {string} params.imageRepo - Docker image repository
 * @param {string} params.gitRepoUrl - Git repository URL
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function createPipelineJob({ appName, imageRepo, gitRepoUrl }) {
    if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
        console.warn('[Jenkins] Missing configuration, skipping job creation');
        return { success: false, message: 'Jenkins not configured' };
    }

    const jobName = appName;
    const webuiUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Check if job already exists
    const exists = await jobExists(jobName);
    if (exists) {
        console.log(`[Jenkins] Job '${jobName}' already exists, skipping creation`);
        return { success: true, message: `Job '${jobName}' already exists` };
    }

    const jobXml = generateJobConfigXml({ appName, imageRepo, gitRepoUrl, webuiUrl });

    try {
        // First, get crumb for CSRF protection
        let crumb = null;
        try {
            const crumbResponse = await fetch(`${JENKINS_URL}/crumbIssuer/api/json`, {
                method: 'GET',
                headers: {
                    'Authorization': getAuthHeader(),
                },
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
            'Content-Type': 'application/xml',
        };

        if (crumb) {
            headers[crumb.crumbRequestField] = crumb.crumb;
        }

        const response = await fetch(`${JENKINS_URL}/createItem?name=${encodeURIComponent(jobName)}`, {
            method: 'POST',
            headers,
            body: jobXml,
        });

        if (response.ok) {
            console.log(`[Jenkins] Successfully created job '${jobName}'`);
            return { success: true, message: `Jenkins job '${jobName}' created successfully` };
        } else {
            const errorText = await response.text();
            console.error(`[Jenkins] Failed to create job: ${response.status}`, errorText);
            return { success: false, message: `Failed to create Jenkins job: ${response.status}` };
        }
    } catch (error) {
        console.error('[Jenkins] Error creating job:', error.message);
        return { success: false, message: `Jenkins error: ${error.message}` };
    }
}

/**
 * Delete a Jenkins job
 * @param {string} jobName - Name of the job to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function deleteJob(jobName) {
    if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
        console.warn('[Jenkins] Missing configuration, skipping job deletion');
        return { success: false, message: 'Jenkins not configured' };
    }

    // Check if job exists
    const exists = await jobExists(jobName);
    if (!exists) {
        console.log(`[Jenkins] Job '${jobName}' does not exist, skipping deletion`);
        return { success: true, message: `Job '${jobName}' does not exist` };
    }

    try {
        // Get crumb for CSRF protection
        let crumb = null;
        try {
            const crumbResponse = await fetch(`${JENKINS_URL}/crumbIssuer/api/json`, {
                method: 'GET',
                headers: {
                    'Authorization': getAuthHeader(),
                },
            });
            if (crumbResponse.ok) {
                const crumbData = await crumbResponse.json();
                crumb = crumbData;
            }
        } catch (e) {
            console.log('[Jenkins] Crumb issuer not available');
        }

        const headers = {
            'Authorization': getAuthHeader(),
        };

        if (crumb) {
            headers[crumb.crumbRequestField] = crumb.crumb;
        }

        const response = await fetch(`${JENKINS_URL}/job/${encodeURIComponent(jobName)}/doDelete`, {
            method: 'POST',
            headers,
        });

        if (response.ok || response.status === 302) {
            console.log(`[Jenkins] Successfully deleted job '${jobName}'`);
            return { success: true, message: `Jenkins job '${jobName}' deleted successfully` };
        } else {
            const errorText = await response.text();
            console.error(`[Jenkins] Failed to delete job: ${response.status}`, errorText);
            return { success: false, message: `Failed to delete Jenkins job: ${response.status}` };
        }
    } catch (error) {
        console.error('[Jenkins] Error deleting job:', error.message);
        return { success: false, message: `Jenkins error: ${error.message}` };
    }
}
