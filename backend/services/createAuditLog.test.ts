import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuditLog } from './createAuditLog.ts';

test('createAuditLog inserts audit records with metadata json', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createAuditLog({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'audit-1', entity_type: 'clinical_note' }] as T[],
      };
    },
  });

  const result = await service({
    entityType: 'clinical_note',
    entityId: 'clinical-note-1',
    action: 'finalized',
    actorUserId: 'user-1',
    metadata: { status: 'final' },
  });

  assert.match(calls[0].sql, /INSERT INTO audit_logs/);
  assert.equal((result as { id: string }).id, 'audit-1');
});
