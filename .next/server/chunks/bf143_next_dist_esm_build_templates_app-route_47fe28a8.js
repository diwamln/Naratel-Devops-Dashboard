module.exports=[72979,e=>{"use strict";var t=e.i(47839),a=e.i(77588),r=e.i(240),n=e.i(34396),s=e.i(40418),o=e.i(65869),i=e.i(26761),l=e.i(24467),d=e.i(776),p=e.i(58262),c=e.i(97344),u=e.i(66840),S=e.i(75027),g=e.i(41200),R=e.i(80270),m=e.i(87401),E=e.i(93695);e.i(96917);var A=e.i(88273),y=e.i(79425),D=e.i(33405),_=e.i(22734),h=e.i(14747),f=e.i(46786),T=e.i(45559),v=e.i(54053);async function b(e){let t=await e.json(),a=h.default.join(f.default.tmpdir(),"manifest-repo-workdir"),r=h.default.join(a,"registry.json"),n=process.env.GITHUB_TOKEN,s=process.env.MANIFEST_REPO_URL,o=process.env.GIT_USER_NAME||"Naratel DevOps Dashboard",i=process.env.GIT_USER_EMAIL||"devops@naratel.com";return s&&n?await T.gitMutex.runExclusive(async()=>{try{let e=s.replace("https://",`https://${n}@`);if(_.default.existsSync(a)){console.log(`Updating repository at ${a}...`);try{(0,D.execSync)("git fetch origin",{cwd:a}),(0,D.execSync)("git reset --hard origin/main",{cwd:a})}catch(t){console.warn("Git pull/reset failed, attempting to re-clone...",t.message),_.default.rmSync(a,{recursive:!0,force:!0}),(0,D.execSync)(`git clone ${e} ${a}`),(0,D.execSync)(`git config user.name "${o}"`,{cwd:a}),(0,D.execSync)(`git config user.email "${i}"`,{cwd:a})}}else console.log(`Cloning repository to ${a}...`),(0,D.execSync)(`git clone ${e} ${a}`),(0,D.execSync)(`git config user.name "${o}"`,{cwd:a}),(0,D.execSync)(`git config user.email "${i}"`,{cwd:a})}catch(e){return console.error("Git Setup Failed:",e.message),y.NextResponse.json({error:"Failed to initialize git repository: "+e.message},{status:500})}try{if(_.default.existsSync(r)){let e=_.default.readFileSync(r,"utf8"),a=JSON.parse(e);if(a.some(e=>e.id===t.appId)){console.log(`[CONFLICT] App ID ${t.appId} is already taken. Calculating new ID...`);let e=0;a.forEach(t=>{let a=parseInt(t.id);!isNaN(a)&&a>e&&(e=a)});let r=String(e+1).padStart(3,"0");console.log(`[RESOLVED] Auto-assigning new ID: ${r}`),t.appId=r}}}catch(e){console.warn("Failed to validate App ID collision:",e.message)}let e=[],l=[],d=t.imageRepo;d&&d.startsWith("dockerio/")&&(d=d.replace("dockerio/",""));let p=(r,n,s)=>{let o=h.default.join(a,"apps",r),i=h.default.join(o,"values.yaml"),p=h.default.join(o,"secrets.yaml");_.default.existsSync(o)?console.log(`Folder ${r} exists, updating...`):_.default.mkdirSync(o,{recursive:!0});let{values:c,secrets:u,appSecretObj:S,dbSecretObj:g}=((e,a)=>{let r=t.appName,n=t.appId,s={};if(t.appSecrets&&Array.isArray(t.appSecrets)&&t.appSecrets.forEach(e=>{let t=e.value;"prod"===a&&e.valueProd&&(t=e.valueProd),"testing"===a&&e.valueTest&&(t=e.valueTest),e.key&&null!=t&&(s[e.key]=t)}),"none"!==t.dbType){let e="postgres"===t.dbType?"5432":"3306",r=t.appName.replace(/-/g,"_");s.DB_HOST=`svc-db-${t.appName}-${t.appId}.${t.appId}-db-${t.appName}-${a}.svc.cluster.local`,s.DB_PORT=e,s.DB_NAME&&!s.DB_DATABASE&&(s.DB_DATABASE=s.DB_NAME),s.DB_USER&&!s.DB_USERNAME&&(s.DB_USERNAME=s.DB_USER),s.DB_PASS&&!s.DB_PASSWORD&&(s.DB_PASSWORD=s.DB_PASS),s.DB_DATABASE||(s.DB_DATABASE=r),s.DB_USERNAME||(s.DB_USERNAME="admin"),s.DB_PASSWORD||(s.DB_PASSWORD="changeme_securely")}let o={};if(t.dbSecrets&&Array.isArray(t.dbSecrets)&&t.dbSecrets.forEach(e=>{let t=e.value;"prod"===a&&e.valueProd&&(t=e.valueProd),"testing"===a&&e.valueTest&&(t=e.valueTest),t&&"string"==typeof t&&(t=t.trim()),e.key&&null!=t&&(o[e.key]=t)}),"none"!==t.dbType){let e=t.appName.replace(/-/g,"_");if(console.log("[DEBUG] Mapping DB Secrets for type:",t.dbType),console.log("[DEBUG] Initial dbSecretObj:",JSON.stringify(o,null,2)),"postgres"===t.dbType){Object.keys(o).forEach(e=>{(e.startsWith("MYSQL_")||e.startsWith("MARIADB_"))&&delete o[e]});let t=o.POSTGRESQL_DATABASE||o.POSTGRES_DB||o.DB_NAME||s.DB_NAME||e,a=o.POSTGRESQL_USERNAME||o.POSTGRES_USER||o.DB_USER||s.DB_USER||"admin",r=o.POSTGRESQL_PASSWORD||o.POSTGRES_PASSWORD||o.DB_PASS||s.DB_PASS||"changeme_securely";o.POSTGRESQL_DATABASE=t,o.POSTGRESQL_USERNAME=a,o.POSTGRESQL_PASSWORD=r,o.POSTGRESQL_POSTGRES_PASSWORD=r,delete o.POSTGRES_DB,delete o.POSTGRES_USER,delete o.POSTGRES_PASSWORD,delete o.DB_NAME,delete o.DB_USER,delete o.DB_PASS,delete o.DB_USERNAME,delete o.DB_PASSWORD,delete o.DB_DATABASE}else{Object.keys(o).forEach(e=>{(e.startsWith("POSTGRES_")||e.startsWith("POSTGRESQL_"))&&delete o[e]});let t=o.MARIADB_DATABASE||o.MYSQL_DATABASE||o.DB_NAME||s.DB_NAME||e,a=o.MARIADB_USER||o.MYSQL_USER||o.DB_USER||s.DB_USER||"admin",r=o.MARIADB_PASSWORD||o.MYSQL_PASSWORD||o.DB_PASS||s.DB_PASS||"changeme_securely";o.MARIADB_DATABASE=t,o.MARIADB_USER=a,o.MARIADB_PASSWORD=r,o.MARIADB_ROOT_PASSWORD=o.MARIADB_ROOT_PASSWORD||o.MYSQL_ROOT_PASSWORD||"changeme_root",delete o.MYSQL_DATABASE,delete o.MYSQL_USER,delete o.MYSQL_PASSWORD,delete o.MYSQL_ROOT_PASSWORD,delete o.DB_NAME,delete o.DB_USER,delete o.DB_PASS}console.log("[DEBUG] Final dbSecretObj:",JSON.stringify(o,null,2))}let i=e=>0===Object.keys(e).length?"{}":Object.entries(e).map(([e,t])=>{let a=String(t).replace(/\\/g,"\\\\").replace(/"/g,'"');return`  ${e}: "${a}"`}).join("\n"),l="",p="";if("app-prod"===e&&(p=`secretData:
${i(s)}`,l=`
namespace: prod
controllerType: Deployment

app:
  id: "${n}"
  name: "${r}"
  env: "prod"

image:
  repository: "${d}"
  tag: "${t.imageTag}"

service:
  port: ${t.servicePort}
  targetPort: ${t.targetPort}
`.trim(),t.migrationEnabled&&(l+=`

migration:
  enabled: true
  command: "${t.migrationCommand}"`),"none"!==t.dbType&&(l+=`

backup:
  enabled: true
  type: "${t.dbType}"`),t.ingressEnabled&&(l+=`

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: "${t.ingressHost}"
      path: /
`,t.tlsEnabled&&(l+=`  tls:
    - secretName: "${r}-tls"
      hosts:
        - "${t.ingressHost}"`))),"app-testing"===e&&(p=`secretData:
${i(s)}`,l=`
namespace: testing
controllerType: Deployment

app:
  id: "${n}"
  name: "${r}"
  env: "testing"

image:
  repository: "${t.imageRepo}"
  tag: "${t.imageTag}"

service:
  type: NodePort
  port: ${t.servicePort}
  targetPort: ${t.targetPort}
`.trim(),t.migrationEnabled&&(l+=`

migration:
  enabled: true
  command: "${t.migrationCommand}"`),"none"!==t.dbType&&(l+=`

backup:
  enabled: true
  type: "${t.dbType}"`),t.ingressEnabled&&(l+=`

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: "test-${t.ingressHost}"
      path: /
`)),"db-prod"===e){let e="postgres"===t.dbType?"devopsnaratel/postgresql":"devopsnaratel/mariadb",a="postgres"===t.dbType?"18.1":"12.1.2",s="postgres"===t.dbType?5432:3306;p=`secretData:
${i(o)}`,l=`
namespace: prod
controllerType: StatefulSet

app:
  id: "${n}"
  name: "db-${r}"
  env: "prod"

image:
  repository: "${e}"
  tag: "${a}"

service:
  port: ${s}
  targetPort: ${s}

backup:
  enabled: true
  type: "${t.dbType}"
`.trim()}if("db-testing"===e){let e="postgres"===t.dbType?"devopsnaratel/postgresql":"devopsnaratel/mariadb",a="postgres"===t.dbType?"18.1":"12.1.2",s="postgres"===t.dbType?5432:3306;p=`secretData:
${i(o)}`,l=`
namespace: testing
controllerType: StatefulSet

app:
  id: "${n}"
  name: "${r}-db"
  env: "testing"

image:
  repository: "${e}"
  tag: "${a}"

service:
  port: ${s}
  targetPort: ${s}

backup:
  enabled: true
  type: "${t.dbType}"
`.trim()}return{values:l,secrets:p,appSecretObj:s,dbSecretObj:o}})(n,s);console.log(`[DEBUG] Generating ${r} (${s}):`),n.startsWith("app")?console.log("App Secret Keys:",Object.keys(S)):console.log("DB Secret Keys:",Object.keys(g)),_.default.writeFileSync(i,c),_.default.writeFileSync(p,u);try{(0,D.execSync)(`sops --encrypt --age age1ywhtcmyuhmfa32kfaaxcak4dvq27q9g6m55gqlzu2vlwkgfj24wq3g4ejx --encrypted-regex '^(secretData)$' --in-place ${p}`,{cwd:a}),e.push(r)}catch(e){console.error(`Encryption failed for ${r}`,e),l.push(`Encryption failed for ${r}: ${e.message}`)}};try{p(`${t.appName}-prod`,"app-prod","prod"),"none"!==t.dbType&&p(`${t.appName}-db-prod`,"db-prod","prod");try{let e=[];if(_.default.existsSync(r)){let t=_.default.readFileSync(r,"utf8");try{e=JSON.parse(t)}catch(t){e=[]}}let a=e.findIndex(e=>e.id===t.appId),n={id:t.appId,name:t.appName,image:`${d}:${t.imageTag}`,db:t.dbType,ingressHost:t.ingressEnabled?t.ingressHost:null,gitRepoUrl:t.gitRepoUrl||null,createdAt:new Date().toISOString()};a>=0?e[a]=n:e.push(n),_.default.writeFileSync(r,JSON.stringify(e,null,2))}catch(e){l.push("Failed to update registry.json: "+e.message)}if(l.length>0)return y.NextResponse.json({error:l.join(", "),generated:e},{status:400});let n=`feat: add/update manifests for ${t.appName} (split structure)`;(0,D.execSync)("git add .",{cwd:a});try{(0,D.execSync)(`git commit -m "${n}"`,{cwd:a}),(0,D.execSync)("git push origin main",{cwd:a})}catch(e){if(e.message.includes("nothing to commit"))return y.NextResponse.json({message:"No changes detected."});throw e}let s="";if(t.gitRepoUrl)try{let e=await (0,v.createPipelineJob)({appName:t.appName,imageRepo:d,gitRepoUrl:t.gitRepoUrl});e.success?(s=` | ${e.message}`,console.log(`[Jenkins] ${e.message}`)):(s=` | Jenkins: ${e.message}`,console.warn(`[Jenkins] ${e.message}`))}catch(e){console.error("[Jenkins] Failed to create pipeline:",e.message),s=" | Jenkins pipeline creation failed (non-blocking)"}return y.NextResponse.json({message:`Success! Generated ${e.join(", ")}${s}`,folders:e})}catch(e){return console.error(e),y.NextResponse.json({error:e.message},{status:500})}}):y.NextResponse.json({error:"Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing."},{status:500})}e.s(["POST",()=>b],41931);var O=e.i(41931);let $=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/manifest/generate/route",pathname:"/api/manifest/generate",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/webui-devops/Naratel-Devops-Dashboard/src/app/api/manifest/generate/route.js",nextConfigOutput:"standalone",userland:O}),{workAsyncStorage:P,workUnitAsyncStorage:B,serverHooks:N}=$;function w(){return(0,r.patchFetch)({workAsyncStorage:P,workUnitAsyncStorage:B})}async function x(e,t,r){$.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let y="/api/manifest/generate/route";y=y.replace(/\/index$/,"")||"/";let D=await $.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!D)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:_,params:h,nextConfig:f,parsedUrl:T,isDraftMode:v,prerenderManifest:b,routerServerContext:O,isOnDemandRevalidate:P,revalidateOnlyGenerated:B,resolvedPathname:N,clientReferenceManifest:w,serverActionsManifest:x}=D,M=(0,l.normalizeAppPath)(y),U=!!(b.dynamicRoutes[M]||b.routes[N]),I=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,T,!1):t.end("This page could not be found"),null);if(U&&!v){let e=!!b.routes[N],t=b.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(f.experimental.adapterPath)return await I();throw new E.NoFallbackError}}let C=null;!U||$.isDev||v||(C="/index"===(C=N)?"/":C);let k=!0===$.isDev||!U,j=U&&!k;x&&w&&(0,o.setReferenceManifestsSingleton)({page:y,clientReferenceManifest:w,serverActionsManifest:x,serverModuleMap:(0,i.createServerModuleMap)({serverActionsManifest:x})});let G=e.method||"GET",L=(0,s.getTracer)(),W=L.getActiveScopeSpan(),H={params:h,prerenderManifest:b,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:k,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:f.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>$.onRequestError(e,t,r,O)},sharedContext:{buildId:_}},F=new d.NodeNextRequest(e),q=new d.NodeNextResponse(t),Q=p.NextRequestAdapter.fromNodeNextRequest(F,(0,p.signalFromNodeResponse)(t));try{let o=async e=>$.handle(Q,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=L.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${G} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${G} ${y}`)}),i=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var s,l;let d=async({previousCacheEntry:a})=>{try{if(!i&&P&&B&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await o(n);e.fetchMetrics=H.renderOpts.fetchMetrics;let l=H.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let d=H.renderOpts.collectedTags;if(!U)return await (0,S.sendResponse)(F,q,s,H.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,g.toNodeOutgoingHttpHeaders)(s.headers);d&&(t[m.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,r=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:A.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await $.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:P})},O),t}},p=await $.handleResponse({req:e,nextConfig:f,cacheKey:C,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:P,revalidateOnlyGenerated:B,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:i});if(!U)return null;if((null==p||null==(s=p.value)?void 0:s.kind)!==A.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",P?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,g.fromNodeOutgoingHttpHeaders)(p.value.headers);return i&&U||c.delete(m.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,R.getCacheControlHeader)(p.cacheControl)),await (0,S.sendResponse)(F,q,new Response(p.value.body,{headers:c,status:p.value.status||200})),null};W?await l(W):await L.withPropagatedContext(e.headers,()=>L.trace(c.BaseServerSpan.handleRequest,{spanName:`${G} ${y}`,kind:s.SpanKind.SERVER,attributes:{"http.method":G,"http.target":e.url}},l))}catch(t){if(t instanceof E.NoFallbackError||await $.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:P})}),U)throw t;return await (0,S.sendResponse)(F,q,new Response(null,{status:500})),null}}e.s(["handler",()=>x,"patchFetch",()=>w,"routeModule",()=>$,"serverHooks",()=>N,"workAsyncStorage",()=>P,"workUnitAsyncStorage",()=>B],72979)}];

//# sourceMappingURL=bf143_next_dist_esm_build_templates_app-route_47fe28a8.js.map