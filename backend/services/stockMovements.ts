export function listStockMovements(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    inventoryItemId?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['m.clinic_id = $1', 'm.deleted_at IS NULL'];

    if (input.inventoryItemId) {
      params.push(input.inventoryItemId);
      conditions.push(`m.inventory_item_id = $${params.length}`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT
          m.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code
        FROM stock_movements m
        JOIN inventory_items i ON i.id = m.inventory_item_id
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY m.moved_at DESC, m.created_at DESC
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
