import { Worker } from 'node:worker_threads';
import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

// Frozen unchanged HEAD modules; fixture mutations exist only in workers.
const bundle = readFileSync(new URL('./legacy-engine.cjs', import.meta.url), 'utf8');
const hashes = JSON.parse(readFileSync(new URL('./source-hashes.json', import.meta.url), 'utf8'));
if (createHash('sha256').update(bundle).digest('hex') !== hashes.files['benchmarks/baseline/legacy-engine.cjs']) throw Error('Legacy snapshot hash mismatch');
const code = bundle + `\n{
const {parentPort,workerData}=require('node:worker_threads');
const {performance}=require('node:perf_hooks');
const {createHash}=require('node:crypto');
const {generateTravelPlan,swapSpotInPlan,SPOTS_DATA,ALLEY_DISTRICTS,PlanApiClient}=module.exports;
const input={budget:50000,districtId:'jeonpo',theme:'cafe_dessert',transitType:'transit_walk',partySize:1};
const original=structuredClone(SPOTS_DATA);
if(workerData.size){
 let seed=20260924; const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const rows=[]; const cats=workerData.distribution==='uniform'?['food','cafe','admission','snack']:['food','food','food','food','food','food','food','cafe','admission','snack'];
 for(let i=0;i<workerData.size;i++){
  const district=ALLEY_DISTRICTS[i%ALLEY_DISTRICTS.length].id;
  const category=cats[Math.floor(i/ALLEY_DISTRICTS.length)%cats.length];
  const pool=original.filter(s=>s.districtId===district&&s.category===category);
  const spot=pool[Math.floor(random()*pool.length)];
  if(!spot)throw Error('Empty fixture source '+district+'/'+category);
  rows.push({...spot,id:'synthetic-'+String(i).padStart(5,'0'),price:Math.floor(random()*151)*100});
 }
 SPOTS_DATA.splice(0,SPOTS_DATA.length,...rows);
}
if(workerData.defects){
 (async()=>{
 const one=generateTravelPlan(input);const eight=generateTravelPlan({...input,partySize:8});
 const low=generateTravelPlan({...input,budget:1});
 const wrong=original.find(s=>s.districtId!=='jeonpo'&&s.category==='cafe');
 const swapped=swapSpotInPlan(one,2,wrong.id);
 globalThis.window={location:{origin:'http://localhost:5173'}};
 globalThis.fetch=async()=>{throw Error('synthetic offline')}; console.warn=()=>{};
 const saved=await PlanApiClient.savePlan(one);
 SPOTS_DATA.splice(0,SPOTS_DATA.length,...original.filter(s=>!(s.districtId==='jeonpo'&&s.category==='food')));
 let missing;try{generateTravelPlan(input);missing='no throw'}catch(e){missing=e.message}
 parentPort.postMessage({kind:'defects',party:{one:one.costBreakdown.totalSpent,eight:eight.costBreakdown.totalSpent},overBudget:low.costBreakdown,swap:{requested:wrong.id,item:swapped.items.find(i=>i.order===2)},saveFailure:{success:saved.success,slugPrefix:saved.slug.split('-')[0],message:saved.message},emptyFood:missing});
 })();
}else{
 const counts={};for(const s of SPOTS_DATA){const k=s.districtId+'/'+s.category;counts[k]=(counts[k]||0)+1;}
 parentPort.postMessage({kind:'ready',size:SPOTS_DATA.length,counts,sha256:createHash('sha256').update(JSON.stringify(SPOTS_DATA)).digest('hex'),input});
 parentPort.on('message',()=>{const start=performance.now();const p=generateTravelPlan(input);parentPort.postMessage({kind:'sample',ms:performance.now()-start,total:p.costBreakdown.totalSpent,ids:p.items.map(i=>i.spot.id)});});
}
}\n`;

async function measure(config) {
 const worker = new Worker(code, { eval: true, workerData: config });
 const result = { ...config, warmup: [], samples: [], timeoutMs: 2000, requestedWarmup: 10, requestedSamples: 100 };
 return await new Promise((resolve, reject) => {
  let timer; let finished=false;
  const finish=async()=>{if(finished)return;finished=true;clearTimeout(timer);await worker.terminate();resolve(result);};
  const next=()=>{timer=setTimeout(()=>{result.timeout={phase:result.warmup.length<10?'warmup':'measurement',index:result.warmup.length<10?result.warmup.length:result.samples.length,lowerBoundMs:2000};result.status='timeout';result.p95Ms=null;result.unexecutedSamples=100-result.samples.length;void finish();},2000);worker.postMessage('run');};
  worker.on('error',reject);
  worker.on('message',message=>{
   clearTimeout(timer);
   if(message.kind==='defects'){result.evidence=message;void finish();return;}
   if(message.kind==='ready'){result.fixture=message;next();return;}
   if(result.warmup.length<10)result.warmup.push(message.ms);else result.samples.push(message.ms);
   if(result.samples.length===100){result.status='complete';const sorted=[...result.samples].sort((a,b)=>a-b);result.p50Ms=sorted[49];result.p95Ms=sorted[94];result.maxMs=sorted[99];void finish();}else next();
  });
 });
}
const startedAt=new Date().toISOString();
const defects=await measure({name:'existing-defects',defects:true});
const cases=[];
for(const config of [{name:'original'},...['uniform','food-skewed'].flatMap(distribution=>[1000,10000].map(size=>({name:size+'-'+distribution,size,distribution})))]) {
 const result=await measure(config);cases.push(result);console.log(result.name,result.status,'p95',result.p95Ms,'samples',result.samples.length);
}
const assets=readdirSync('dist/assets').map(file=>{const bytes=readFileSync('dist/assets/'+file);return {file,bytes:bytes.length,gzipBytes:gzipSync(bytes).length,sha256:createHash('sha256').update(bytes).digest('hex')};});
const report={runId:'agent02-20260924T100752+0900-4cb7ca8',baseCommit:hashes.baseCommit,checkoutCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),startedAt,finishedAt:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0].model,logicalCPUs:os.cpus().length,memoryBytes:os.totalmem()},protocol:{seed:20260924,warmup:10,repetitions:100,timeoutMs:2000,timeoutPolicy:'Stop case at first 2s watchdog timeout; retain timeout and mark later samples unexecuted. No p95 for incomplete cases.',clock:'performance.now inside persistent worker; excludes startup/bundling/fixture construction',input:'same jeonpo 50000 KRW cafe_dessert, partySize=1',prices:'synthetic uniform integer 0..15000 step 100',rendering:'not measured'},cases,defects: defects.evidence,assets};
writeFileSync('benchmarks/baseline/baseline.json',JSON.stringify(report,null,2)+'\n');
