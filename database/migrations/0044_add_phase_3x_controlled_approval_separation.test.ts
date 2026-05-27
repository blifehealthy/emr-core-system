import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('0044 controlled reconciliation approval separation migration prevents same closer and approver', () => {
  const sql = readFileSync(
    'database/migrations/0044_add_phase_3x_controlled_approval_separation.up.sql',
    'utf8'
  );

  assert.match(sql, /controlled_substance_reconciliations_approver_not_closer/);
  assert.match(sql, /approved_by_user_id <> closed_by_user_id/);
});
