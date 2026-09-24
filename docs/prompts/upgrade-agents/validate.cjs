const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const flag = process.argv.indexOf('--yaml-module');
const YAML = require(flag >= 0 ? path.resolve(process.argv[flag + 1]) : 'yaml');
const root = __dirname;
const repo = path.resolve(root, '../../..');
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.ya?ml$/.test(full)) files.push(full);
  }
}
walk(root);
assert.equal(files.length, 4, 'Exactly four YAML prompt files are required');
const agents = new Map();
const tasks = new Map();
const docs = files.sort().map(file => {
  const doc = YAML.parseDocument(fs.readFileSync(file, 'utf8'), { uniqueKeys: true });
  assert.equal(doc.errors.length, 0, `${file}: ${doc.errors.map(e => e.message).join('; ')}`);
  const value = doc.toJS();
  assert.equal(value.schema_version, 2);
  assert.equal(value.kind, 'self_contained_agent_prompt');
  assert(!agents.has(value.agent_id));
  agents.set(value.agent_id, value);
  return { file, value };
});
const expectedIds = ['agent_01', 'agent_02', 'agent_03', 'agent_04'];
assert.deepEqual([...agents.keys()].sort(), expectedIds);
const canonical = docs[0].value;
for (const { file, value: agent } of docs) {
  assert.equal(agent.agent_id, expectedIds[agent.sequence - 1]);
  assert(path.basename(file).startsWith(String(agent.sequence).padStart(2, '0') + '-'));
  assert.deepEqual(agent.common_protocol, canonical.common_protocol, 'Common protocol copies differ');
  assert.deepEqual(agent.ownership_registry, canonical.ownership_registry, 'Ownership copies differ');
  assert.deepEqual(agent.agent_registry, canonical.agent_registry, 'Agent registries differ');
  assert.equal(agent.common_protocol.max_agents, 4);
  assert.equal(agent.common_protocol.coordinator_counts_toward_limit, true);
  assert.equal(agent.common_protocol.spawn_additional_agents, false);
  assert.deepEqual(agent.write_scope, agent.ownership_registry[agent.agent_id]);
  assert(agent.write_scope.includes(`docs/reports/handoffs/${agent.agent_id}/**`));
  assert(agent.prompt.length > 800 && agent.fallback_work.length > 0);
  for (const ref of agent.context_files) {
    assert(!path.isAbsolute(ref) && !ref.split('/').includes('..'));
    assert(fs.existsSync(path.join(repo, ref)), `Missing context ${ref}`);
  }
  for (const scope of agent.write_scope) assert(!path.isAbsolute(scope) && !scope.split('/').includes('..'));
  assert.deepEqual([...agent.priority_queue].sort(), agent.work_items.map(t => t.id).sort());
  for (const task of agent.work_items) {
    assert(!tasks.has(task.id), `Duplicate task ${task.id}`);
    assert.equal(task.owner, agent.agent_id);
    assert(agents.has(task.reviewer) && task.reviewer !== task.owner, `Self/unknown reviewer ${task.id}`);
    assert(task.steps.length >= 3 && task.deliverables.length && task.acceptance.length >= 2);
    tasks.set(task.id, task);
  }
}
assert.equal(tasks.size, 27);
const expectedParents = [7, 6, 7].flatMap((count, index) =>
  Array.from({ length: count }, (_, i) => `P${index + 1}-${String(i + 1).padStart(2, '0')}`));
const parents = new Set([...tasks.values()].flatMap(t => t.parent_tasks));
assert.deepEqual([...parents].sort(), expectedParents.sort(), 'Original 20 work items must all be represented');
for (const ref of canonical.agent_registry) {
  assert(fs.existsSync(path.join(root, ref.file)));
  assert.equal(agents.get(ref.id).sequence, ref.slot);
}
const visiting = new Set();
const done = new Set();
function checkDAG(id) {
  assert(tasks.has(id), `Unknown dependency ${id}`);
  assert(!visiting.has(id), `Dependency cycle at ${id}`);
  if (done.has(id)) return;
  visiting.add(id);
  tasks.get(id).depends_on.forEach(checkDAG);
  visiting.delete(id);
  done.add(id);
}
tasks.forEach(task => checkDAG(task.id));
const exactScopes = new Map();
for (const [owner, scopes] of Object.entries(canonical.ownership_registry)) {
  assert(agents.has(owner));
  for (const scope of scopes) {
    assert(!exactScopes.has(scope), `Duplicate scope ${scope}`);
    exactScopes.set(scope, owner);
  }
}
// The configured scopes use literal paths, /** prefixes, and filename * patterns.
function matches(scope, file) {
  if (scope.endsWith('/**')) return file.startsWith(scope.slice(0, -2));
  const regex = scope.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*');
  return new RegExp(`^${regex}$`).test(file);
}
const probes = ['src/App.tsx', 'src/types/index.ts', 'src/domain/types.ts', 'package.json',
  'src/shared/api/stamp.ts', 'src/server/app.ts', 'src/server/controllers/stamps/claim.ts',
  'src/server/controllers/rag/recommend.ts', 'src/server/repositories/stamps.ts',
  'src/server/application/stamps/claim.ts', 'src/server/providers/signing/issuer.ts',
  'jobs/chain-indexer/main.ts', 'chain/package.json', 'db/migrations/001.sql', 'tests/e2e/main.ts'];
for (const file of probes) {
  const owners = Object.entries(canonical.ownership_registry).filter(([, scopes]) => scopes.some(s => matches(s, file)));
  assert.equal(owners.length, 1, `Expected exactly one writer for ${file}`);
}
console.log(`PASS: 4 YAML prompts, 4 agents, ${tasks.size} execution items, ${parents.size} original tasks; policies, ownership probes and dependency DAG valid.`);
