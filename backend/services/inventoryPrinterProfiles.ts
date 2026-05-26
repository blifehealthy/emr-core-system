import type {
  CreateInventoryPrinterProfileInput,
  UpdateInventoryPrinterProfileInput,
} from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function listInventoryPrinterProfiles(db: Db) {
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
        FROM inventory_printer_profiles
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY is_default DESC, is_active DESC, profile_name ASC, created_at DESC
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

export function createInventoryPrinterProfile(db: Db) {
  return async function run(input: CreateInventoryPrinterProfileInput) {
    if (input.isDefault === true) {
      await db.query(
        `
          UPDATE inventory_printer_profiles
          SET is_default = FALSE
          WHERE clinic_id = $1
            AND deleted_at IS NULL
        `,
        [input.clinicId]
      );
    }

    const result = await db.query(
      `
        INSERT INTO inventory_printer_profiles (
          clinic_id,
          profile_name,
          printer_language,
          connection_type,
          endpoint_url,
          location_name,
          is_default,
          is_active,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        input.clinicId,
        input.profileName,
        input.printerLanguage ?? 'zpl',
        input.connectionType ?? 'browser',
        input.endpointUrl ?? null,
        input.locationName ?? null,
        input.isDefault ?? false,
        input.isActive ?? true,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function updateInventoryPrinterProfile(db: Db) {
  return async function run(input: UpdateInventoryPrinterProfileInput) {
    const existing = await db.query<{ clinic_id: string }>(
      `
        SELECT clinic_id
        FROM inventory_printer_profiles
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.profileId]
    );
    const clinicId = existing.rows[0]?.clinic_id;
    if (!clinicId) return null;

    if (input.isDefault === true) {
      await db.query(
        `
          UPDATE inventory_printer_profiles
          SET is_default = FALSE
          WHERE clinic_id = $1
            AND id <> $2
            AND deleted_at IS NULL
        `,
        [clinicId, input.profileId]
      );
    }

    const assignments: string[] = [];
    const params: unknown[] = [input.profileId];
    const fieldMap: Array<[keyof UpdateInventoryPrinterProfileInput, string]> = [
      ['profileName', 'profile_name'],
      ['printerLanguage', 'printer_language'],
      ['connectionType', 'connection_type'],
      ['endpointUrl', 'endpoint_url'],
      ['locationName', 'location_name'],
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
          FROM inventory_printer_profiles
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [input.profileId]
      );
      return result.rows[0] ?? null;
    }

    const result = await db.query(
      `
        UPDATE inventory_printer_profiles
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
