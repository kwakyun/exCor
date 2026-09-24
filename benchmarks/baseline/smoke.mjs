import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createServer } from 'node:net';

// Probe an OS-selected free port. Release before Vite binds: strictPort makes
// any intervening race fail, rather than using or stopping another service.
const probe = createServer();
await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(0, '127.0.0.1', resolve); });
const port = probe.address().port;
await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let output = '';
try {
 const url = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Vite startup timeout 10s')), 10000);
  child.once('error', error => { clearTimeout(timer); reject(error); });
  child.once('exit', code => { clearTimeout(timer); reject(new Error('Vite exited '+code)); });
  child.stderr.on('data', bytes => { output += bytes.toString(); });
  child.stdout.on('data', bytes => {
   output += bytes.toString().replace(/\x1b\[[0-9;]*m/g, '');
   const match = output.match(/http:\/\/127\.0\.0\.1:\d+\//);
   if (match) { clearTimeout(timer); resolve(match[0]); }
  });
 });
 if (new URL(url).port !== String(port)) throw Error('Unexpected Vite port');
 const requests = [];
 for (const path of ['', 'api/plans/bsn-jeonpo50', 'api/curations/popular']) {
  const response = await fetch(url + path, { signal: AbortSignal.timeout(5000) });
  const text = await response.text();
  requests.push({ path: '/' + path, status: response.status, contentType: response.headers.get('content-type'), bytes: Buffer.byteLength(text), valid: path ? JSON.parse(text).success === true : text.includes('id="root"') });
 }
 writeFileSync('benchmarks/baseline/runtime.json', JSON.stringify({ at: new Date().toISOString(), url, portSelection: 'net.listen(0) probe then close; Vite explicit port with strictPort; race fails startup', requests, browserRendering: 'not measured; HTTP smoke only' }, null, 2) + '\n');
 console.log(JSON.stringify(requests));
 if (requests.some(r => r.status !== 200 || !r.valid)) process.exitCode = 1;
} finally { child.kill(); }
