import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInventoryBarcodeLabelTemplate,
  listInventoryBarcodeLabelTemplates,
  updateInventoryBarcodeLabelTemplate,
} from './inventoryBarcodeLabelTemplates.ts';

test('inventory barcode label template services list create and update templates', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('SELECT *') && sql.includes('inventory_barcode_label_templates')) {
        return {
          rows: [
            { id: 'template-1', template_name: 'Item label' },
            { id: 'template-2', template_name: 'Lot label' },
          ] as T[],
        };
      }
      if (sql.includes('INSERT INTO inventory_barcode_label_templates')) {
        return { rows: [{ id: 'template-3', enabled_fields: params?.[6] }] as T[] };
      }
      if (sql.includes('SELECT clinic_id, template_type')) {
        return { rows: [{ clinic_id: 'clinic-1', template_type: 'item' }] as T[] };
      }
      if (sql.includes('UPDATE inventory_barcode_label_templates') && sql.includes('RETURNING')) {
        return { rows: [{ id: 'template-1', is_default: params?.includes(true) }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const list = await listInventoryBarcodeLabelTemplates(db)({
    clinicId: 'clinic-1',
    active: 'active',
    templateType: 'item',
    limit: 1,
  });
  const created = await createInventoryBarcodeLabelTemplate(db)({
    clinicId: 'clinic-1',
    templateName: 'Item label',
    templateType: 'item',
    enabledFields: ['title', 'barcode'],
    isDefault: true,
  });
  const updated = await updateInventoryBarcodeLabelTemplate(db)({
    templateId: 'template-1',
    isDefault: true,
    footerText: 'Store cold',
  });

  assert.equal(list.rows.length, 1);
  assert.equal(list.meta.hasMore, true);
  assert.equal((created as { id: string }).id, 'template-3');
  assert.equal((updated as { id: string }).id, 'template-1');
  assert.ok(calls.some((call) => /SET is_default = FALSE/.test(call.sql)));
  assert.ok(calls.some((call) => call.params?.includes(JSON.stringify(['title', 'barcode']))));
});
