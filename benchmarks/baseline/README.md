# Legacy baseline provenance

Base: 4cb7ca83069f58103707426f215de5c96bddfe01. Agent02 run: agent02-20260924T100752+0900-4cb7ca8.

The initial measurement bundled the unchanged TypeScript modules in memory using the installed lockfile's esbuild. After measurement, the same stdin/options captured `legacy-engine.cjs` while `git diff -- src package.json package-lock.json` was empty. `source-hashes.json` records the source, lock and snapshot SHA256. This is generated baseline evidence, not a second production engine.

Capture used `buildSync({stdin:{contents: entry, resolveDir:process.cwd(), loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text` with this entry:

```ts
export { generateTravelPlan, swapSpotInPlan } from './src/services/budgetCalculator';
export { SPOTS_DATA, ALLEY_DISTRICTS } from './src/data/busanAlleys';
export { PlanApiClient } from './src/services/planApi';
```

`node benchmarks/baseline/run.mjs` checks the snapshot hash and measures that frozen code, then writes baseline.json. Preserve existing raw results before rerunning. Asset sizes come from the current dist: rebuild the same base checkout to reproduce the original asset measurement; do not label a later build as legacy.

`node benchmarks/baseline/smoke.mjs` verifies the current Vite/legacy API, not the frozen snapshot. It checks an OS-selected free loopback port, releases it, and starts Vite on that explicit port with strictPort. A race fails startup. Initial `--port 0` actually fell back to 5173; the corrected run used 49908 and passed all three requests. It stops only its own process.

Rendering and field Web Vitals are unmeasured. The first 10k warmup timeout leaves the remaining samples unexecuted, never silently omitted from a reported p95. Full protocol/limitations: docs/reports/performance/baseline.md.
