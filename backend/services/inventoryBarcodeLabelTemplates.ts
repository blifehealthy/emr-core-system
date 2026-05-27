import type {
  CreateInventoryBarcodeLabelTemplateInput,
  UpdateInventoryBarcodeLabelTemplateInput,
} from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function listInventoryBarcodeLabelTemplates(db: Db) {
  return async function run(input: {
    clinicId: string;
    active?: 'active' | 'inactive' | 'all';
    templateType?: 'item' | 'lot' | 'bin' | 'generic';
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];

    if (input.active === 'active') conditions.push('is_active IS TRUE');
    if (input.active === 'inactive') conditions.push('is_active IS FALSE');
    if (input.templateType) {
      params.push(input.templateType);
      conditions.push(`template_type = $${params.length}`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT *
        FROM inventory_barcode_label_templates
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY is_default DESC, is_active DESC, template_type ASC, template_name ASC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `,
      params
    );
    const rows = result.rows.slice(0, limit);

    return {
      rows,
      meta: {
        limit,
        offset,
        hasMore: result.rows.length > limit,
        nextOffset: result.rows.length > limit ? offset + limit : null,
      },
    };
  };
}

export function createInventoryBarcodeLabelTemplate(db: Db) {
  return async function run(input: CreateInventoryBarcodeLabelTemplateInput) {
    const templateType = input.templateType ?? 'generic';
    if (input.isDefault === true) {
      await clearDefaultTemplate(db, input.clinicId, templateType);
    }

    const result = await db.query(
      `
        INSERT INTO inventory_barcode_label_templates (
          clinic_id,
          template_name,
          template_type,
          printer_language,
          width_mm,
          height_mm,
          enabled_fields,
          header_text,
          footer_text,
          is_default,
          is_active,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12)
        RETURNING *
      `,
      [
        input.clinicId,
        input.templateName,
        templateType,
        input.printerLanguage ?? 'zpl',
        input.widthMm ?? null,
        input.heightMm ?? null,
        JSON.stringify(input.enabledFields ?? ['title', 'subtitle', 'barcode', 'detail']),
        input.headerText ?? null,
        input.footerText ?? null,
        input.isDefault ?? false,
        input.isActive ?? true,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function updateInventoryBarcodeLabelTemplate(db: Db) {
  return async function run(input: UpdateInventoryBarcodeLabelTemplateInput) {
    const existing = await db.query<{ clinic_id: string; template_type: 'item' | 'lot' | 'bin' | 'generic' }>(
      `
        SELECT clinic_id, template_type
        FROM inventory_barcode_label_templates
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.templateId]
    );
    const row = existing.rows[0];
    if (!row) return null;

    const nextType = input.templateType ?? row.template_type;
    if (input.isDefault === true) {
      await clearDefaultTemplate(db, row.clinic_id, nextType, input.templateId);
    }

    const params: unknown[] = [input.templateId];
    const assignments: string[] = [];
    const fieldMap: Array<[keyof UpdateInventoryBarcodeLabelTemplateInput, string]> = [
      ['templateName', 'template_name'],
      ['templateType', 'template_type'],
      ['printerLanguage', 'printer_language'],
      ['widthMm', 'width_mm'],
      ['heightMm', 'height_mm'],
      ['headerText', 'header_text'],
      ['footerText', 'footer_text'],
      ['isDefault', 'is_default'],
      ['isActive', 'is_active'],
      ['notes', 'notes'],
    ];

    for (const [inputKey, column] of fieldMap) {
      if (!Object.hasOwn(input, inputKey)) continue;
      params.push(input[inputKey] ?? null);
      assignments.push(`${column} = $${params.length}`);
    }
    if (Object.hasOwn(input, 'enabledFields')) {
      params.push(JSON.stringify(input.enabledFields ?? []));
      assignments.push(`enabled_fields = $${params.length}::jsonb`);
    }

    if (assignments.length === 0) {
      const result = await db.query(
        `
          SELECT *
          FROM inventory_barcode_label_templates
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [input.templateId]
      );
      return result.rows[0] ?? null;
    }

    const result = await db.query(
      `
        UPDATE inventory_barcode_label_templates
        SET ${assignments.join(', ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}

async function clearDefaultTemplate(
  db: Db,
  clinicId: string,
  templateType: string,
  excludeTemplateId?: string
) {
  const params = [clinicId, templateType, excludeTemplateId ?? null];
  await db.query(
    `
      UPDATE inventory_barcode_label_templates
      SET is_default = FALSE
      WHERE clinic_id = $1
        AND template_type = $2
        AND ($3::uuid IS NULL OR id <> $3)
        AND deleted_at IS NULL
    `,
    params
  );
}
