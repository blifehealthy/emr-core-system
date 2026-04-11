import test from 'node:test';
import assert from 'node:assert/strict';
import { getAuditLogsByEntity } from './getAuditLogsByEntity.ts';

test('getAuditLogsByEntity returns logs for a specific entity', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getAuditLogsByEntity({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'audit-1', entity_type: 'clinical_note' }] as T[] };
    },
  });

  const result = await service({
    entityType: 'clinical_note',
    entityId: 'clinical-note-1',
  });

  assert.match(calls[0].sql, /FROM audit_logs/);
  assert.deepEqual(calls[0].params, ['clinical_note', 'clinical-note-1', 50]);
  assert.equal((result[0] as { id: string }).id, 'audit-1');
});
