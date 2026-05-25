import test from 'node:test';
import assert from 'node:assert/strict';
import { createDrugInteractionRule } from './createDrugInteractionRule.ts';

test('createDrugInteractionRule inserts an active interaction rule', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createDrugInteractionRule({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'rule-1', severity: 'critical' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    primaryRxnormCode: 'RX-WARFARIN',
    interactingMedicationName: 'Ibuprofen',
    severity: 'critical',
    description: 'Bleeding risk',
  });

  assert.match(calls[0].sql, /INSERT INTO drug_interaction_rules/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    null,
    null,
    'RX-WARFARIN',
    null,
    null,
    'Ibuprofen',
    'critical',
    'Bleeding risk',
    null,
    true,
  ]);
  assert.equal((result as { id: string }).id, 'rule-1');
});
