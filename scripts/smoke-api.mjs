import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const probe = createServer();
await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(0, '127.0.0.1', resolve); });
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const child = spawn(process.execPath, ['--import', 'tsx', 'src/server/server.ts'], {
  env: { ...process.env, PORT: String(port) }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('API startup timeout')), 10000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(Error('API exited ' + code)); });
    child.stdout.on('data', bytes => { if (bytes.toString().includes(String(port))) { clearTimeout(timer); resolve(); } });
  });
  for (const path of ['/api/plans/bsn-jeonpo50', '/api/curations/popular']) {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { signal: AbortSignal.timeout(5000) });
    const body = await res.json();
    if (res.status !== 200 || body.success !== true) throw Error(`${path}: ${res.status}`);
    console.log(JSON.stringify({ path, status: res.status, success: body.success, port }));
  }
} finally { child.kill(); }
