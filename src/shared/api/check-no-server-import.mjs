// P1-05 acceptance: "src/server 구현을 브라우저에서 import하지 않음"을 정적으로 확인한다.
// 사용: node src/shared/api/check-no-server-import.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here).filter((f) => f.endsWith('.ts'));
let violations = [];

for (const file of files) {
  const content = readFileSync(join(here, file), 'utf8');
  const importLines = content.match(/^import .*from ['"].*['"];?$/gm) || [];
  for (const line of importLines) {
    if (/['"][./]*server\//.test(line) || /['"]\.\.\/server/.test(line)) {
      violations.push(`${file}: ${line.trim()}`);
    }
  }
}

if (violations.length > 0) {
  console.error('src/shared/api must not import from src/server/**:');
  violations.forEach((v) => console.error('  ' + v));
  process.exit(1);
}

console.log(`OK: ${files.length}개 파일 중 src/server import 없음 (${files.join(', ')})`);
