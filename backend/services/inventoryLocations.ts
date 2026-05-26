import type {
  CreateInventoryLocationInput,
  UpdateInventoryLocationInput,
} from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function listInventoryLocations(db: Db) {
  return async function run(input: {
    clinicId: string;
    active?: 'active' | 'inactive' | 'all';
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];

    if (input.active === 'active') {
      conditions.push('is_active IS TRUE');
    } else if (input.active === 'inactive') {
      conditions.push('is_active IS FALSE');
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT *
        FROM inventory_locations
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY is_default DESC, is_active DESC, display_name ASC, created_at DESC
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

export function createInventoryLocation(db: Db) {
  return async function run(input: CreateInventoryLocationInput) {
    if (input.isDefault === true) {
      await db.query(
        `
          UPDATE inventory_locations
          SET is_default = FALSE
          WHERE clinic_id = $1
            AND deleted_at IS NULL
        `,
        [input.clinicId]
      );
    }

    const result = await db.query(
      `
        INSERT INTO inventory_locations (
          clinic_id,
          location_code,
          display_name,
          location_type,
          is_default,
          is_active,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [
        input.clinicId,
        input.locationCode,
        input.displayName,
        input.locationType ?? 'pharmacy',
        input.isDefault ?? false,
        input.isActive ?? true,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function updateInventoryLocation(db: Db) {
  return async function run(input: UpdateInventoryLocationInput) {
    const existing = await db.query<{ clinic_id: string }>(
      `
        SELECT clinic_id
        FROM inventory_locations
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.locationId]
    );
    const clinicId = existing.rows[0]?.clinic_id;
    if (!clinicId) return null;

    if (input.isDefault === true) {
      await db.query(
        `
          UPDATE inventory_locations
          SET is_default = FALSE
          WHERE clinic_id = $1
            AND id <> $2
            AND deleted_at IS NULL
        `,
        [clinicId, input.locationId]
      );
    }

    const assignments: string[] = [];
    const params: unknown[] = [input.locationId];
    const fieldMap: Array<[keyof UpdateInventoryLocationInput, string]> = [
      ['locationCode', 'location_code'],
      ['displayName', 'display_name'],
      ['locationType', 'location_type'],
      ['isDefault', 'is_default'],
      ['isActive', 'is_active'],
      ['notes', 'notes'],
    ];

    for (const [inputKey, column] of fieldMap) {
      if (!Object.hasOwn(input, inputKey)) continue;
      params.push(input[inputKey] ?? null);
      assignments.push(`${column} = $${params.length}`);
    }

    if (assignments.length === 0) {
      const result = await db.query(
        `
          SELECT *
          FROM inventory_locations
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [input.locationId]
      );
      return result.rows[0] ?? null;
    }

    const result = await db.query(
      `
        UPDATE inventory_locations
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
