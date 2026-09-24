// Run with node --test. The .check.mjs suffix avoids Vitest auto-discovery.
// Contract artifact self-check only. Does not import or certify the product implementation.
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const read = name => JSON.parse(readFileSync(new URL(`../../docs/contracts/fixtures/${name}-v1.json`, import.meta.url), 'utf8'));
const core = read('core');

test('synthetic expected totals account for every traveller and vehicle rounding', () => {
  for (const item of core.cases.filter(c => c.expected.status === 'ok')) {
    const { input, expected } = item;
    const transit = core.catalog.transit.find(t => t.type === input.transitType);
    const travel = transit.perPersonLegKRW * input.partySize + transit.perVehicleLegKRW * Math.ceil(input.partySize / transit.vehicleCapacity);
    const spots = expected.orderedSpotIds.map(id => core.catalog.spots.find(s => s.id === id));
    assert.deepEqual(spots.map(s => s.category), ['food', 'cafe', 'admission']);
    const spent = spots.reduce((sum, s) => sum + s.unitPriceKRW * input.partySize, travel);
    assert.equal(expected.transitCostKRW, travel);
    assert.equal(expected.totalSpent, spent);
    assert.equal(expected.remainingBudget, input.budgetKRW - spent);
    assert.ok(expected.remainingBudget >= 0);
  }
});
test('infeasible lower bound and swap extra cost are independently consistent', () => {
  const base = core.cases.find(c => c.id === 'two-person');
  const fail = core.cases.find(c => c.id === 'below-minimum');
  assert.equal(fail.expected.minimumRequiredKRW, base.expected.totalSpent);
  assert.ok(fail.input.budgetKRW < fail.expected.minimumRequiredKRW);
  const swap = core.swapCases.find(c => c.id === 'over-budget-swap');
  const cafe = core.catalog.spots.find(s => s.category === 'cafe');
  assert.equal(swap.expected.additionalBudgetKRW, base.expected.totalSpent + (swap.replacement.unitPriceKRW - cafe.unitPriceKRW) * base.input.partySize - base.input.budgetKRW);
});
test('fixture envelopes distinguish normal RAG abstention from infrastructure errors', () => {
  for (const c of read('api').cases.filter(c => c.response)) {
    assert.equal(typeof c.response.requestId, 'string');
    assert.notEqual('data' in c.response, 'error' in c.response);
    assert.equal('error' in c.response, c.expectedHttp >= 400);
  }
});
test('claim fields and expiry boundaries are explicit without fabricated crypto outputs', () => {
  const c = read('claim');
  assert.equal(c.primaryType, 'Claim');
  assert.equal(c.types.Claim.map(f => `${f.type} ${f.name}`).join(','), 'address recipient,bytes32 campaignId,bytes32 spotId,uint256 nonce,uint256 deadline');
  for (const b of c.boundaryCases) assert.equal(BigInt(b.now) <= BigInt(c.input.deadline) ? 'allow' : 'reject', b.expected);
  assert.equal(c.expectedHashes, null);
});
test('swap fixtures register complete replacement spots and isolate unknown IDs', () => {
  for (const c of core.swapCases) {
    const catalog = structuredClone(core.catalog);
    if (c.replacement) {
      for (const field of ['id','districtId','name','category','active','unitPriceKRW','pricingUnit','tags']) assert.ok(field in c.replacement, `${c.id}: ${field}`);
      assert.ok(!catalog.spots.some(s => s.id === c.replacement.id));
      catalog.spots.push(c.replacement);
      assert.equal(catalog.spots.filter(s => s.id === c.replacement.id).length, 1);
    } else {
      assert.equal(c.id, 'unknown-id');
      assert.ok(!catalog.spots.some(s => s.id === c.spotId));
    }
  }
});
test('save/get/recommendation snapshots and every source reference match', () => {
  const cases = read('api').cases;
  const saved = cases.find(c => c.id === 'save').response.data;
  assert.deepEqual(cases.find(c => c.id === 'get-saved').response.data, saved);
  const rag = cases.find(c => c.id === 'recommendation-ok');
  assert.deepEqual(rag.response.data.plan, saved.snapshot);
  assert.equal(saved.snapshot.catalogVersion, core.catalog.version);
  assert.equal(saved.snapshot.pricingPolicyVersion, core.catalog.pricingPolicyVersion);
  for (const item of saved.snapshot.items) {
    const spot = core.catalog.spots.find(s => s.id === item.spotId);
    assert.ok(spot);
    assert.equal(item.unitPriceKRW, spot.unitPriceKRW);
    assert.equal(item.costKRW, spot.unitPriceKRW * saved.snapshot.preference.partySize);
  }
  for (const claim of rag.response.data.claims) {
    assert.ok(core.catalog.spots.some(s => s.id === claim.spotId));
    for (const id of claim.sourceIds) {
      assert.ok(rag.response.data.sources.some(s => s.id === id));
      assert.equal(rag.evidence.sourceId, id);
      assert.ok(rag.evidence.locator && rag.evidence.text);
    }
  }
});
