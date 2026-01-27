module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},46786,(e,t,r)=>{t.exports=e.x("os",()=>require("os"))},33405,(e,t,r)=>{t.exports=e.x("child_process",()=>require("child_process"))},45559,e=>{"use strict";Error("timeout while waiting for mutex to become available"),Error("mutex already locked");let t=Error("request for lock canceled");class r{constructor(e,r=t){this._value=e,this._cancelError=r,this._queue=[],this._weightedWaiters=[]}acquire(e=1,t=0){if(e<=0)throw Error(`invalid weight ${e}: must be positive`);return new Promise((r,n)=>{let i={resolve:r,reject:n,weight:e,priority:t},o=s(this._queue,e=>t<=e.priority);-1===o&&e<=this._value?this._dispatchItem(i):this._queue.splice(o+1,0,i)})}runExclusive(e){var t,r,s,n;return t=this,r=arguments,s=void 0,n=function*(e,t=1,r=0){let[s,n]=yield this.acquire(t,r);try{return yield e(s)}finally{n()}},new(s||(s=Promise))(function(e,i){function o(e){try{l(n.next(e))}catch(e){i(e)}}function a(e){try{l(n.throw(e))}catch(e){i(e)}}function l(t){var r;t.done?e(t.value):((r=t.value)instanceof s?r:new s(function(e){e(r)})).then(o,a)}l((n=n.apply(t,r||[])).next())})}waitForUnlock(e=1,t=0){if(e<=0)throw Error(`invalid weight ${e}: must be positive`);return this._couldLockImmediately(e,t)?Promise.resolve():new Promise(r=>{var n,i;let o;this._weightedWaiters[e-1]||(this._weightedWaiters[e-1]=[]),n=this._weightedWaiters[e-1],i={resolve:r,priority:t},o=s(n,e=>i.priority<=e.priority),n.splice(o+1,0,i)})}isLocked(){return this._value<=0}getValue(){return this._value}setValue(e){this._value=e,this._dispatchQueue()}release(e=1){if(e<=0)throw Error(`invalid weight ${e}: must be positive`);this._value+=e,this._dispatchQueue()}cancel(){this._queue.forEach(e=>e.reject(this._cancelError)),this._queue=[]}_dispatchQueue(){for(this._drainUnlockWaiters();this._queue.length>0&&this._queue[0].weight<=this._value;)this._dispatchItem(this._queue.shift()),this._drainUnlockWaiters()}_dispatchItem(e){let t=this._value;this._value-=e.weight,e.resolve([t,this._newReleaser(e.weight)])}_newReleaser(e){let t=!1;return()=>{t||(t=!0,this.release(e))}}_drainUnlockWaiters(){if(0===this._queue.length)for(let e=this._value;e>0;e--){let t=this._weightedWaiters[e-1];t&&(t.forEach(e=>e.resolve()),this._weightedWaiters[e-1]=[])}else{let e=this._queue[0].priority;for(let t=this._value;t>0;t--){let r=this._weightedWaiters[t-1];if(!r)continue;let s=r.findIndex(t=>t.priority<=e);(-1===s?r:r.splice(0,s)).forEach(e=>e.resolve())}}}_couldLockImmediately(e,t){return(0===this._queue.length||this._queue[0].priority<t)&&e<=this._value}}function s(e,t){for(let r=e.length-1;r>=0;r--)if(t(e[r]))return r;return -1}let n=new class{constructor(e){this._semaphore=new r(1,e)}acquire(){var e,t,r,s;return e=this,t=arguments,r=void 0,s=function*(e=0){let[,t]=yield this._semaphore.acquire(1,e);return t},new(r||(r=Promise))(function(n,i){function o(e){try{l(s.next(e))}catch(e){i(e)}}function a(e){try{l(s.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?n(e.value):((t=e.value)instanceof r?t:new r(function(e){e(t)})).then(o,a)}l((s=s.apply(e,t||[])).next())})}runExclusive(e,t=0){return this._semaphore.runExclusive(()=>e(),1,t)}isLocked(){return this._semaphore.isLocked()}waitForUnlock(e=0){return this._semaphore.waitForUnlock(1,e)}release(){this._semaphore.isLocked()&&this._semaphore.release()}cancel(){return this._semaphore.cancel()}};e.s(["gitMutex",0,n],45559)},54053,e=>{"use strict";let t=process.env.JENKINS_URL,r=process.env.JENKINS_USER,s=process.env.JENKINS_API_TOKEN;function n(){let e=Buffer.from(`${r}:${s}`).toString("base64");return`Basic ${e}`}async function i(e){if(!t||!r||!s)return console.warn("[Jenkins] Missing configuration, skipping job check"),!1;try{return(await fetch(`${t}/job/${encodeURIComponent(e)}/api/json`,{method:"GET",headers:{Authorization:n()}})).ok}catch(e){return console.error("[Jenkins] Error checking job:",e.message),!1}}async function o({appName:e,imageRepo:o,gitRepoUrl:a}){if(!t||!r||!s)return console.warn("[Jenkins] Missing configuration, skipping job creation"),{success:!1,message:"Jenkins not configured"};let l=process.env.NEXT_PUBLIC_APP_URL||process.env.NEXTAUTH_URL||"http://localhost:3000";if(await i(e))return console.log(`[Jenkins] Job '${e}' already exists, skipping creation`),{success:!0,message:`Job '${e}' already exists`};let c=function({appName:e,imageRepo:t,gitRepoUrl:r,webuiUrl:s}){return(function({appName:e,imageRepo:t,gitRepoUrl:r,webuiUrl:s}){return`pipeline {
    agent any

    environment {
        APP_NAME       = "${e}"
        DOCKER_IMAGE   = "${t}"
        DOCKER_CRED_ID = "docker-hub"

        // URL WebUI Base
        WEBUI_API      = "${s}"
        
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
}`})({appName:e,imageRepo:t,gitRepoUrl:r,webuiUrl:s}).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"),`<?xml version='1.1' encoding='UTF-8'?>
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
          <url>${r}</url>
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
</flow-definition>`}({appName:e,imageRepo:o,gitRepoUrl:a,webuiUrl:l});try{let r=null;try{let e=await fetch(`${t}/crumbIssuer/api/json`,{method:"GET",headers:{Authorization:n()}});e.ok&&(r=await e.json())}catch(e){console.log("[Jenkins] Crumb issuer not available, proceeding without CSRF token")}let s={Authorization:n(),"Content-Type":"application/xml"};r&&(s[r.crumbRequestField]=r.crumb);let i=await fetch(`${t}/createItem?name=${encodeURIComponent(e)}`,{method:"POST",headers:s,body:c});if(i.ok)return console.log(`[Jenkins] Successfully created job '${e}'`),{success:!0,message:`Jenkins job '${e}' created successfully`};{let e=await i.text();return console.error(`[Jenkins] Failed to create job: ${i.status}`,e),{success:!1,message:`Failed to create Jenkins job: ${i.status}`}}}catch(e){return console.error("[Jenkins] Error creating job:",e.message),{success:!1,message:`Jenkins error: ${e.message}`}}}async function a(e){if(!t||!r||!s)return console.warn("[Jenkins] Missing configuration, skipping job deletion"),{success:!1,message:"Jenkins not configured"};if(!await i(e))return console.log(`[Jenkins] Job '${e}' does not exist, skipping deletion`),{success:!0,message:`Job '${e}' does not exist`};try{let r=null;try{let e=await fetch(`${t}/crumbIssuer/api/json`,{method:"GET",headers:{Authorization:n()}});e.ok&&(r=await e.json())}catch(e){console.log("[Jenkins] Crumb issuer not available")}let s={Authorization:n()};r&&(s[r.crumbRequestField]=r.crumb);let i=await fetch(`${t}/job/${encodeURIComponent(e)}/doDelete`,{method:"POST",headers:s});if(i.ok||302===i.status)return console.log(`[Jenkins] Successfully deleted job '${e}'`),{success:!0,message:`Jenkins job '${e}' deleted successfully`};{let e=await i.text();return console.error(`[Jenkins] Failed to delete job: ${i.status}`,e),{success:!1,message:`Failed to delete Jenkins job: ${i.status}`}}}catch(e){return console.error("[Jenkins] Error deleting job:",e.message),{success:!1,message:`Jenkins error: ${e.message}`}}}e.s(["createPipelineJob",()=>o,"deleteJob",()=>a])},88912,e=>{"use strict";var t=e.i(47839),r=e.i(77588),s=e.i(240),n=e.i(34396),i=e.i(40418),o=e.i(65869),a=e.i(26761),l=e.i(24467),c=e.i(776),u=e.i(58262),d=e.i(97344),p=e.i(66840),h=e.i(75027),g=e.i(41200),f=e.i(80270),m=e.i(87401),y=e.i(93695);e.i(96917);var w=e.i(88273),v=e.i(79425),x=e.i(33405),_=e.i(22734),E=e.i(14747),R=e.i(46786),b=e.i(45559),k=e.i(54053);async function $(e){let{appId:t,appName:r}=await e.json();return t&&r?await b.gitMutex.runExclusive(async()=>{let e=E.default.join(R.default.tmpdir(),"manifest-repo-workdir"),s=E.default.join(e,"registry.json"),n=E.default.join(e,"apps"),i=process.env.GITHUB_TOKEN,o=process.env.MANIFEST_REPO_URL,a=process.env.GIT_USER_NAME||"Naratel DevOps Dashboard",l=process.env.GIT_USER_EMAIL||"devops@naratel.com";if(!o||!i)return v.NextResponse.json({error:"Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing."},{status:500});try{let c=o.replace("https://",`https://${i}@`);if(_.default.existsSync(e))try{(0,x.execSync)("git fetch origin",{cwd:e}),(0,x.execSync)("git reset --hard origin/main",{cwd:e})}catch(t){_.default.rmSync(e,{recursive:!0,force:!0}),(0,x.execSync)(`git clone ${c} ${e}`),(0,x.execSync)(`git config user.name "${a}"`,{cwd:e}),(0,x.execSync)(`git config user.email "${l}"`,{cwd:e})}else(0,x.execSync)(`git clone ${c} ${e}`),(0,x.execSync)(`git config user.name "${a}"`,{cwd:e}),(0,x.execSync)(`git config user.email "${l}"`,{cwd:e});let u=[];_.default.existsSync(n)&&_.default.readdirSync(n).forEach(e=>{if(e===`${r}-prod`||e===`${r}-testing`||e===`${r}-db-prod`||e===`${r}-db-testing`){let t=E.default.join(n,e);_.default.rmSync(t,{recursive:!0,force:!0}),u.push(e)}});let d=[];if(_.default.existsSync(s))try{d=JSON.parse(_.default.readFileSync(s,"utf8"))}catch(e){console.error("Failed to parse registry",e)}let p=d.length;if(d=d.filter(e=>e.id!==t),0===u.length&&d.length===p)return v.NextResponse.json({message:"App not found or already deleted."});_.default.writeFileSync(s,JSON.stringify(d,null,2));let h=`chore: delete application ${r} (ID: ${t})`;(0,x.execSync)("git add .",{cwd:e});try{if(!(0,x.execSync)("git status --porcelain",{cwd:e}).toString().trim())return v.NextResponse.json({message:"No changes to commit (already clean)."});(0,x.execSync)(`git commit -m "${h}"`,{cwd:e}),(0,x.execSync)("git push origin main",{cwd:e})}catch(e){throw Error("Git push failed: "+e.message)}let g="";try{let e=await (0,k.deleteJob)(r);e.success?(g=` | ${e.message}`,console.log(`[Jenkins] ${e.message}`)):(g=` | Jenkins: ${e.message}`,console.warn(`[Jenkins] ${e.message}`))}catch(e){console.error("[Jenkins] Failed to delete pipeline:",e.message),g=" | Jenkins job deletion failed (non-blocking)"}return v.NextResponse.json({message:`Successfully deleted ${r}${g}`,deletedFolders:u})}catch(e){return console.error(e),v.NextResponse.json({error:e.message},{status:500})}}):v.NextResponse.json({error:"Missing appId or appName"},{status:400})}e.s(["POST",()=>$,"dynamic",0,"force-dynamic"],64282);var P=e.i(64282);let S=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/manifest/delete/route",pathname:"/api/manifest/delete",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/webui-devops/Naratel-Devops-Dashboard/src/app/api/manifest/delete/route.js",nextConfigOutput:"standalone",userland:P}),{workAsyncStorage:I,workUnitAsyncStorage:A,serverHooks:C}=S;function j(){return(0,s.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:A})}async function N(e,t,s){S.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let v="/api/manifest/delete/route";v=v.replace(/\/index$/,"")||"/";let x=await S.prepare(e,t,{srcPage:v,multiZoneDraftMode:!1});if(!x)return t.statusCode=400,t.end("Bad Request"),null==s.waitUntil||s.waitUntil.call(s,Promise.resolve()),null;let{buildId:_,params:E,nextConfig:R,parsedUrl:b,isDraftMode:k,prerenderManifest:$,routerServerContext:P,isOnDemandRevalidate:I,revalidateOnlyGenerated:A,resolvedPathname:C,clientReferenceManifest:j,serverActionsManifest:N}=x,T=(0,l.normalizeAppPath)(v),U=!!($.dynamicRoutes[T]||$.routes[C]),O=async()=>((null==P?void 0:P.render404)?await P.render404(e,t,b,!1):t.end("This page could not be found"),null);if(U&&!k){let e=!!$.routes[C],t=$.dynamicRoutes[T];if(t&&!1===t.fallback&&!e){if(R.experimental.adapterPath)return await O();throw new y.NoFallbackError}}let q=null;!U||S.isDev||k||(q="/index"===(q=C)?"/":q);let J=!0===S.isDev||!U,D=U&&!J;N&&j&&(0,o.setReferenceManifestsSingleton)({page:v,clientReferenceManifest:j,serverActionsManifest:N,serverModuleMap:(0,a.createServerModuleMap)({serverActionsManifest:N})});let M=e.method||"GET",F=(0,i.getTracer)(),B=F.getActiveScopeSpan(),H={params:E,prerenderManifest:$,renderOpts:{experimental:{authInterrupts:!!R.experimental.authInterrupts},cacheComponents:!!R.cacheComponents,supportsDynamicResponse:J,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:R.cacheLife,waitUntil:s.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,s)=>S.onRequestError(e,t,s,P)},sharedContext:{buildId:_}},W=new c.NodeNextRequest(e),L=new c.NodeNextResponse(t),K=u.NextRequestAdapter.fromNodeNextRequest(W,(0,u.signalFromNodeResponse)(t));try{let o=async e=>S.handle(K,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=F.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=r.get("next.route");if(s){let t=`${M} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${M} ${v}`)}),a=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var i,l;let c=async({previousCacheEntry:r})=>{try{if(!a&&I&&A&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await o(n);e.fetchMetrics=H.renderOpts.fetchMetrics;let l=H.renderOpts.pendingWaitUntil;l&&s.waitUntil&&(s.waitUntil(l),l=void 0);let c=H.renderOpts.collectedTags;if(!U)return await (0,h.sendResponse)(W,L,i,H.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,g.toNodeOutgoingHttpHeaders)(i.headers);c&&(t[m.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,s=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:w.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:s}}}}catch(t){throw(null==r?void 0:r.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:I})},P),t}},u=await S.handleResponse({req:e,nextConfig:R,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:$,isRoutePPREnabled:!1,isOnDemandRevalidate:I,revalidateOnlyGenerated:A,responseGenerator:c,waitUntil:s.waitUntil,isMinimalMode:a});if(!U)return null;if((null==u||null==(i=u.value)?void 0:i.kind)!==w.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(l=u.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});a||t.setHeader("x-nextjs-cache",I?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),k&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,g.fromNodeOutgoingHttpHeaders)(u.value.headers);return a&&U||d.delete(m.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,f.getCacheControlHeader)(u.cacheControl)),await (0,h.sendResponse)(W,L,new Response(u.value.body,{headers:d,status:u.value.status||200})),null};B?await l(B):await F.withPropagatedContext(e.headers,()=>F.trace(d.BaseServerSpan.handleRequest,{spanName:`${M} ${v}`,kind:i.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},l))}catch(t){if(t instanceof y.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:T,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:I})}),U)throw t;return await (0,h.sendResponse)(W,L,new Response(null,{status:500})),null}}e.s(["handler",()=>N,"patchFetch",()=>j,"routeModule",()=>S,"serverHooks",()=>C,"workAsyncStorage",()=>I,"workUnitAsyncStorage",()=>A],88912)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__d3c38435._.js.map