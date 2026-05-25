import type { CreateChargeTemplateInput, UpdateChargeTemplateInput } from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function listChargeTemplates(db: Db) {
  return async function run(input: {
    clinicId: string;
    active?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];

    if (input.active === 'active') {
      conditions.push('is_active = TRUE');
    } else if (input.active === 'inactive') {
      conditions.push('is_active = FALSE');
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT *
        FROM charge_templates
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY is_active DESC, code ASC
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

export function createChargeTemplate(db: Db) {
  return async function run(input: CreateChargeTemplateInput) {
    const result = await db.query(
      `
        INSERT INTO charge_templates (
          clinic_id,
          code,
          description,
          item_type,
          unit_price_amount,
          tax_amount,
          is_active,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        input.clinicId,
        input.code,
        input.description,
        input.itemType ?? 'procedure',
        input.unitPriceAmount,
        input.taxAmount ?? 0,
        input.isActive ?? true,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function updateChargeTemplate(db: Db) {
  return async function run(input: UpdateChargeTemplateInput) {
    const result = await db.query(
      `
        UPDATE charge_templates
        SET code = COALESCE($2, code),
            description = COALESCE($3, description),
            item_type = COALESCE($4::invoice_line_item_type, item_type),
            unit_price_amount = COALESCE($5, unit_price_amount),
            tax_amount = COALESCE($6, tax_amount),
            is_active = COALESCE($7, is_active),
            notes = COALESCE($8, notes)
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      [
        input.chargeTemplateId,
        input.code ?? null,
        input.description ?? null,
        input.itemType ?? null,
        input.unitPriceAmount ?? null,
        input.taxAmount ?? null,
        input.isActive ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}
