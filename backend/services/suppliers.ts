import type { CreateSupplierInput, UpdateSupplierInput } from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function listSuppliers(db: Db) {
  return async function run(input: {
    clinicId: string;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];

    if (input.status === 'active' || input.status === 'inactive') {
      params.push(input.status);
      conditions.push(`status = $${params.length}`);
    }

    if (input.search) {
      params.push(`%${input.search}%`);
      conditions.push(`(
        supplier_code ILIKE $${params.length}
        OR display_name ILIKE $${params.length}
        OR contact_name ILIKE $${params.length}
      )`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT *
        FROM suppliers
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY display_name ASC, created_at DESC
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

export function createSupplier(db: Db) {
  return async function run(input: CreateSupplierInput) {
    const result = await db.query(
      `
        INSERT INTO suppliers (
          clinic_id,
          supplier_code,
          display_name,
          contact_name,
          phone_number,
          email,
          address,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        input.clinicId,
        input.supplierCode,
        input.displayName,
        input.contactName ?? null,
        input.phoneNumber ?? null,
        input.email ?? null,
        input.address ?? null,
        input.status ?? 'active',
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function updateSupplier(db: Db) {
  return async function run(input: UpdateSupplierInput) {
    const assignments: string[] = [];
    const params: unknown[] = [input.supplierId];
    const fieldMap: Array<[keyof UpdateSupplierInput, string]> = [
      ['supplierCode', 'supplier_code'],
      ['displayName', 'display_name'],
      ['contactName', 'contact_name'],
      ['phoneNumber', 'phone_number'],
      ['email', 'email'],
      ['address', 'address'],
      ['status', 'status'],
      ['notes', 'notes'],
    ];

    for (const [inputKey, column] of fieldMap) {
      if (!Object.hasOwn(input, inputKey)) continue;
      params.push(input[inputKey] ?? null);
      assignments.push(`${column} = $${params.length}`);
    }

    if (assignments.length === 0) {
      const existing = await db.query(
        `
          SELECT *
          FROM suppliers
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [input.supplierId]
      );
      return existing.rows[0] ?? null;
    }

    const result = await db.query(
      `
        UPDATE suppliers
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}
