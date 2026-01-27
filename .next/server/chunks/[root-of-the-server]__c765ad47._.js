module.exports=[93695,(e,t,s)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,s)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,s)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},14747,(e,t,s)=>{t.exports=e.x("path",()=>require("path"))},22734,(e,t,s)=>{t.exports=e.x("fs",()=>require("fs"))},46786,(e,t,s)=>{t.exports=e.x("os",()=>require("os"))},33405,(e,t,s)=>{t.exports=e.x("child_process",()=>require("child_process"))},45559,e=>{"use strict";Error("timeout while waiting for mutex to become available"),Error("mutex already locked");let t=Error("request for lock canceled");class s{constructor(e,s=t){this._value=e,this._cancelError=s,this._queue=[],this._weightedWaiters=[]}acquire(e=1,t=0){if(e<=0)throw Error(`invalid weight ${e}: must be positive`);return new Promise((s,i)=>{let n={resolve:s,reject:i,weight:e,priority:t},o=r(this._queue,e=>t<=e.priority);-1===o&&e<=this._value?this._dispatchItem(n):this._queue.splice(o+1,0,n)})}runExclusive(e){var t,s,r,i;return t=this,s=arguments,r=void 0,i=function*(e,t=1,s=0){let[r,i]=yield this.acquire(t,s);try{return yield e(r)}finally{i()}},new(r||(r=Promise))(function(e,n){function o(e){try{c(i.next(e))}catch(e){n(e)}}function a(e){try{c(i.throw(e))}catch(e){n(e)}}function c(t){var s;t.done?e(t.value):((s=t.value)instanceof r?s:new r(function(e){e(s)})).then(o,a)}c((i=i.apply(t,s||[])).next())})}waitForUnlock(e=1,t=0){if(e<=0)throw Error(`invalid weight ${e}: must be positive`);return this._couldLockImmediately(e,t)?Promise.resolve():new Promise(s=>{var i,n;let o;this._weightedWaiters[e-1]||(this._weightedWaiters[e-1]=[]),i=this._weightedWaiters[e-1],n={resolve:s,priority:t},o=r(i,e=>n.priority<=e.priority),i.splice(o+1,0,n)})}isLocked(){return this._value<=0}getValue(){return this._value}setValue(e){this._value=e,this._dispatchQueue()}release(e=1){if(e<=0)throw Error(`invalid weight ${e}: must be positive`);this._value+=e,this._dispatchQueue()}cancel(){this._queue.forEach(e=>e.reject(this._cancelError)),this._queue=[]}_dispatchQueue(){for(this._drainUnlockWaiters();this._queue.length>0&&this._queue[0].weight<=this._value;)this._dispatchItem(this._queue.shift()),this._drainUnlockWaiters()}_dispatchItem(e){let t=this._value;this._value-=e.weight,e.resolve([t,this._newReleaser(e.weight)])}_newReleaser(e){let t=!1;return()=>{t||(t=!0,this.release(e))}}_drainUnlockWaiters(){if(0===this._queue.length)for(let e=this._value;e>0;e--){let t=this._weightedWaiters[e-1];t&&(t.forEach(e=>e.resolve()),this._weightedWaiters[e-1]=[])}else{let e=this._queue[0].priority;for(let t=this._value;t>0;t--){let s=this._weightedWaiters[t-1];if(!s)continue;let r=s.findIndex(t=>t.priority<=e);(-1===r?s:s.splice(0,r)).forEach(e=>e.resolve())}}}_couldLockImmediately(e,t){return(0===this._queue.length||this._queue[0].priority<t)&&e<=this._value}}function r(e,t){for(let s=e.length-1;s>=0;s--)if(t(e[s]))return s;return -1}let i=new class{constructor(e){this._semaphore=new s(1,e)}acquire(){var e,t,s,r;return e=this,t=arguments,s=void 0,r=function*(e=0){let[,t]=yield this._semaphore.acquire(1,e);return t},new(s||(s=Promise))(function(i,n){function o(e){try{c(r.next(e))}catch(e){n(e)}}function a(e){try{c(r.throw(e))}catch(e){n(e)}}function c(e){var t;e.done?i(e.value):((t=e.value)instanceof s?t:new s(function(e){e(t)})).then(o,a)}c((r=r.apply(e,t||[])).next())})}runExclusive(e,t=0){return this._semaphore.runExclusive(()=>e(),1,t)}isLocked(){return this._semaphore.isLocked()}waitForUnlock(e=0){return this._semaphore.waitForUnlock(1,e)}release(){this._semaphore.isLocked()&&this._semaphore.release()}cancel(){return this._semaphore.cancel()}};e.s(["gitMutex",0,i],45559)},54053,e=>{"use strict";let t=process.env.JENKINS_URL,s=process.env.JENKINS_USER,r=process.env.JENKINS_API_TOKEN;function i(){let e=Buffer.from(`${s}:${r}`).toString("base64");return`Basic ${e}`}async function n(e){if(!t||!s||!r)return console.warn("[Jenkins] Missing configuration, skipping job check"),!1;try{return(await fetch(`${t}/job/${encodeURIComponent(e)}/api/json`,{method:"GET",headers:{Authorization:i()}})).ok}catch(e){return console.error("[Jenkins] Error checking job:",e.message),!1}}async function o({appName:e,imageRepo:o,gitRepoUrl:a}){if(!t||!s||!r)return console.warn("[Jenkins] Missing configuration, skipping job creation"),{success:!1,message:"Jenkins not configured"};let c=process.env.NEXT_PUBLIC_APP_URL||process.env.NEXTAUTH_URL||"http://localhost:3000";if(await n(e))return console.log(`[Jenkins] Job '${e}' already exists, skipping creation`),{success:!0,message:`Job '${e}' already exists`};let l=function({appName:e,imageRepo:t,gitRepoUrl:s,webuiUrl:r}){return(function({appName:e,imageRepo:t,gitRepoUrl:s,webuiUrl:r}){return`pipeline {
    agent any

    environment {
        APP_NAME       = "${e}"
        DOCKER_IMAGE   = "${t}"
        DOCKER_CRED_ID = "docker-hub"

        // URL WebUI Base
        WEBUI_API      = "${r}"
        
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
}`})({appName:e,imageRepo:t,gitRepoUrl:s,webuiUrl:r}).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"),`<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <description>CI/CD Pipeline for ${e} - Auto-generated by Naratel DevOps Dashboard</description>
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
          <url>${s}</url>
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
</flow-definition>`}({appName:e,imageRepo:o,gitRepoUrl:a,webuiUrl:c});try{let s=null;try{let e=await fetch(`${t}/crumbIssuer/api/json`,{method:"GET",headers:{Authorization:i()}});e.ok&&(s=await e.json())}catch(e){console.log("[Jenkins] Crumb issuer not available, proceeding without CSRF token")}let r={Authorization:i(),"Content-Type":"application/xml"};s&&(r[s.crumbRequestField]=s.crumb);let n=await fetch(`${t}/createItem?name=${encodeURIComponent(e)}`,{method:"POST",headers:r,body:l});if(n.ok)return console.log(`[Jenkins] Successfully created job '${e}'`),{success:!0,message:`Jenkins job '${e}' created successfully`};{let e=await n.text();return console.error(`[Jenkins] Failed to create job: ${n.status}`,e),{success:!1,message:`Failed to create Jenkins job: ${n.status}`}}}catch(e){return console.error("[Jenkins] Error creating job:",e.message),{success:!1,message:`Jenkins error: ${e.message}`}}}async function a(e){if(!t||!s||!r)return console.warn("[Jenkins] Missing configuration, skipping job deletion"),{success:!1,message:"Jenkins not configured"};if(!await n(e))return console.log(`[Jenkins] Job '${e}' does not exist, skipping deletion`),{success:!0,message:`Job '${e}' does not exist`};try{let s=null;try{let e=await fetch(`${t}/crumbIssuer/api/json`,{method:"GET",headers:{Authorization:i()}});e.ok&&(s=await e.json())}catch(e){console.log("[Jenkins] Crumb issuer not available")}let r={Authorization:i()};s&&(r[s.crumbRequestField]=s.crumb);let n=await fetch(`${t}/job/${encodeURIComponent(e)}/doDelete`,{method:"POST",headers:r});if(n.ok||302===n.status)return console.log(`[Jenkins] Successfully deleted job '${e}'`),{success:!0,message:`Jenkins job '${e}' deleted successfully`};{let e=await n.text();return console.error(`[Jenkins] Failed to delete job: ${n.status}`,e),{success:!1,message:`Failed to delete Jenkins job: ${n.status}`}}}catch(e){return console.error("[Jenkins] Error deleting job:",e.message),{success:!1,message:`Jenkins error: ${e.message}`}}}e.s(["createPipelineJob",()=>o,"deleteJob",()=>a])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__c765ad47._.js.map