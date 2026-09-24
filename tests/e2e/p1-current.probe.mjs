// Legacy-only QA probe. Exit 1 means required product invariants are violated.
// Uses isolated in-process Map storage, synthetic input and a rejected fetch.
import { build } from 'esbuild';
const bundle = await build({
  stdin: { contents: `export {generateTravelPlan,swapSpotInPlan} from './src/services/budgetCalculator';
    export {SPOTS_DATA} from './src/data/busanAlleys';
    export {PlanController} from './src/server/controllers/planController';
    export {PlanApiClient} from './src/services/planApi';`, resolveDir: process.cwd() },
  bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
});
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64');
const { generateTravelPlan, swapSpotInPlan, SPOTS_DATA, PlanController, PlanApiClient } = await import(moduleUrl);
const input = {budget:30000,partySize:1,districtId:'jeonpo',theme:'all',transitType:'transit_walk'};
const one = generateTravelPlan(input);
const two = generateTravelPlan({...input,partySize:2});
const tiny = generateTravelPlan({...input,budget:1});
const cafe = one.items.find(i=>i.category==='cafe');
const other = SPOTS_DATA.find(s=>s.districtId!=='jeonpo' && s.category==='food');
const swapped = swapSpotInPlan(one,cafe.order,other.id);
const forged = {...one,costBreakdown:{...one.costBreakdown,totalSpent:-123,remainingBudget:30123}};
const saved = await PlanController.createPlan({plan:forged,authorNickname:'QA synthetic'},'http://localhost');
const freshProcessEquivalent = await import(moduleUrl+'#fresh-module-state');
const freshRead = await freshProcessEquivalent.PlanController.getPlan(saved.data.slug);
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const originalWarn = console.warn;
let fallback;
try {
  globalThis.fetch = async()=>{throw new Error('QA injected storage outage');};
  globalThis.window = {location:{origin:'http://localhost'}};
  console.warn=()=>{};
  fallback = await PlanApiClient.savePlan(one);
} finally {
  globalThis.fetch=originalFetch;
  if (originalWindow === undefined) delete globalThis.window; else globalThis.window=originalWindow;
  console.warn=originalWarn;
}
const findings = [
  {id:'party-size',violated:one.costBreakdown.totalSpent===two.costBreakdown.totalSpent,actual:{one:one.costBreakdown.totalSpent,two:two.costBreakdown.totalSpent},expected:'per-person fixture costs must scale'},
  {id:'over-budget-plan',violated:tiny.costBreakdown.totalSpent>1,actual:{budget:1,...tiny.costBreakdown},expected:'infeasible without formal over-budget plan'},
  {id:'cross-district-category-swap',violated:swapped.items.find(i=>i.order===cafe.order).spot.id===other.id,actual:{from:cafe.spot.id,to:other.id},expected:'reject and preserve original'},
  {id:'forged-total',violated:saved.status===201,actual:{status:saved.status,totalSpent:saved.data.plan?.costBreakdown.totalSpent},expected:'reject forged totals'},
  {id:'module-state-loss',violated:freshRead.status===404,actual:{status:freshRead.status},expected:'durable record across new server state; this is a module-isolation probe, not a real DB restart test'},
  {id:'false-share-success',violated:fallback.success===true && fallback.slug.startsWith('local-'),actual:{success:fallback.success,localSlug:fallback.slug.startsWith('local-')},expected:'no shared-save success after rejected fetch'},
];
console.log(JSON.stringify({kind:'legacy-product-probe',findings,violationCount:findings.filter(f=>f.violated).length},null,2));
process.exitCode=findings.some(f=>f.violated)?1:0;
