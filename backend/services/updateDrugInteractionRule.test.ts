import test from 'node:test';
import assert from 'node:assert/strict';
import { updateDrugInteractionRule } from './updateDrugInteractionRule.ts';

test('updateDrugInteractionRule patches mutable interaction fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateDrugInteractionRule({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'rule-1', is_active: false }] as T[] };
    },
  });

  const result = await service({
    interactionRuleId: 'rule-1',
    recommendation: 'Avoid combination',
    isActive: false,
  });

  assert.match(calls[0].sql, /UPDATE drug_interaction_rules/);
  assert.match(calls[0].sql, /recommendation = \$2/);
  assert.match(calls[0].sql, /is_active = \$3/);
  assert.deepEqual(calls[0].params, ['rule-1', 'Avoid combination', false]);
  assert.equal((result as { id: string }).id, 'rule-1');
});
