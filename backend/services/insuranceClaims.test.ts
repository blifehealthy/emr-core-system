import test from 'node:test';
import assert from 'node:assert/strict';
import { createInsuranceClaim, updateInsuranceClaim } from './insuranceClaims.ts';

test('insurance claim services create and update claim rows', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'claim-1', status: params?.[1] ?? 'draft' }] as T[] };
    },
  };

  const created = await createInsuranceClaim(db)({
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    invoiceId: 'invoice-1',
    claimNumber: 'CLM-1',
    insurerName: 'Insurer',
  });
  const updated = await updateInsuranceClaim(db)({ insuranceClaimId: 'claim-1', status: 'submitted' });

  assert.match(calls[0].sql, /INSERT INTO insurance_claims/);
  assert.match(calls[1].sql, /UPDATE insurance_claims/);
  assert.equal((created as { id: string }).id, 'claim-1');
  assert.equal((updated as { status: string }).status, 'submitted');
});
