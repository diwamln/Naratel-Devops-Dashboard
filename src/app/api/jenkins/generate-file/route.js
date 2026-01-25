import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Generate Jenkinsfile content based on app configuration
 */
function generateJenkinsfile({ appName, imageRepo, webuiUrl }) {
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
                        curl -s -X POST \${WEBUI_API}/api/jenkins/deploy-test \\\\
                        -H "Content-Type: application/json" \\\\
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
                    // Add your test commands here
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
                        curl -s -X POST \${WEBUI_API}/api/manifest/update-image \\\\
                        -H "Content-Type: application/json" \\\\
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
                    curl -s -X POST \${WEBUI_API}/api/jenkins/destroy-test \\\\
                    -H "Content-Type: application/json" \\\\
                    -d '{"appName": "\${APP_NAME}"}'
                """
                cleanWs()
            }
        }
    }
}`;
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const appName = searchParams.get('appName');
    const imageRepo = searchParams.get('imageRepo');

    if (!appName) {
        return NextResponse.json({ error: 'Missing appName parameter' }, { status: 400 });
    }

    // Get WebUI URL from environment or use placeholder
    const webuiUrl = process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        'https://your-webui-url.example.com';

    const jenkinsfile = generateJenkinsfile({
        appName,
        imageRepo: imageRepo || `devopsnaratel/${appName}`,
        webuiUrl
    });

    return NextResponse.json({
        jenkinsfile,
        filename: 'Jenkinsfile',
        appName
    });
}
