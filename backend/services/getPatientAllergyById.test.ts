import test from 'node:test';
import assert from 'node:assert/strict';

import { getPatientAllergyById } from './getPatientAllergyById.ts';

test('getPatientAllergyById reads an active allergy by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getPatientAllergyById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'allergy-1', allergen_name: 'Peanuts' }] as T[] };
    },
  });

  const result = await service({ allergyId: 'allergy-1' });

  assert.match(calls[0].sql, /FROM patient_allergies/);
  assert.deepEqual(calls[0].params, ['allergy-1']);
  assert.equal((result as { id: string }).id, 'allergy-1');
});
