export function getPharmacyOverrideReport(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string; startDate: string; endDate: string }) {
    const result = await db.query(
      `
        WITH override_rows AS (
          SELECT
            'dispense' AS event_type,
            d.id,
            d.dispensed_at AS occurred_at,
            d.inventory_item_id,
            i.display_name AS inventory_item_display_name,
            d.inventory_lot_id,
            lot.lot_number AS inventory_lot_number,
            d.fefo_recommended_lot_id,
            recommended.lot_number AS fefo_recommended_lot_number,
            d.expiry_override_reason,
            d.fefo_override_reason,
            d.dispensed_by_user_id AS actor_user_id,
            d.quantity
          FROM medication_dispenses d
          JOIN inventory_items i ON i.id = d.inventory_item_id
          LEFT JOIN inventory_lots lot ON lot.id = d.inventory_lot_id
          LEFT JOIN inventory_lots recommended ON recommended.id = d.fefo_recommended_lot_id
          WHERE d.clinic_id = $1
            AND d.dispensed_at >= $2::date
            AND d.dispensed_at < ($3::date + INTERVAL '1 day')
            AND d.deleted_at IS NULL
            AND (
              NULLIF(TRIM(COALESCE(d.expiry_override_reason, '')), '') IS NOT NULL
              OR NULLIF(TRIM(COALESCE(d.fefo_override_reason, '')), '') IS NOT NULL
            )
          UNION ALL
          SELECT
            'transfer' AS event_type,
            t.id,
            COALESCE(t.requested_at, t.transferred_at, t.created_at) AS occurred_at,
            t.inventory_item_id,
            i.display_name AS inventory_item_display_name,
            t.inventory_lot_id,
            lot.lot_number AS inventory_lot_number,
            t.fefo_recommended_lot_id,
            recommended.lot_number AS fefo_recommended_lot_number,
            t.expiry_override_reason,
            t.fefo_override_reason,
            COALESCE(t.requested_by_user_id, t.transferred_by_user_id) AS actor_user_id,
            t.quantity
          FROM inventory_transfers t
          JOIN inventory_items i ON i.id = t.inventory_item_id
          LEFT JOIN inventory_lots lot ON lot.id = t.inventory_lot_id
          LEFT JOIN inventory_lots recommended ON recommended.id = t.fefo_recommended_lot_id
          WHERE t.clinic_id = $1
            AND COALESCE(t.requested_at, t.transferred_at, t.created_at) >= $2::date
            AND COALESCE(t.requested_at, t.transferred_at, t.created_at) < ($3::date + INTERVAL '1 day')
            AND t.deleted_at IS NULL
            AND (
              NULLIF(TRIM(COALESCE(t.expiry_override_reason, '')), '') IS NOT NULL
              OR NULLIF(TRIM(COALESCE(t.fefo_override_reason, '')), '') IS NOT NULL
            )
        )
        SELECT json_build_object(
          'start_date', $2,
          'end_date', $3,
          'override_total', (SELECT COUNT(*) FROM override_rows),
          'dispense_override_total', (SELECT COUNT(*) FROM override_rows WHERE event_type = 'dispense'),
          'transfer_override_total', (SELECT COUNT(*) FROM override_rows WHERE event_type = 'transfer'),
          'expiry_override_total', (
            SELECT COUNT(*)
            FROM override_rows
            WHERE NULLIF(TRIM(COALESCE(expiry_override_reason, '')), '') IS NOT NULL
          ),
          'fefo_override_total', (
            SELECT COUNT(*)
            FROM override_rows
            WHERE NULLIF(TRIM(COALESCE(fefo_override_reason, '')), '') IS NOT NULL
          ),
          'by_event_type', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT event_type, COUNT(*)::int AS count
              FROM override_rows
              GROUP BY event_type
              ORDER BY event_type ASC
            ) t
          ), '[]'::json),
          'by_item', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT inventory_item_id, inventory_item_display_name, COUNT(*)::int AS count
              FROM override_rows
              GROUP BY inventory_item_id, inventory_item_display_name
              ORDER BY count DESC, inventory_item_display_name ASC
              LIMIT 10
            ) t
          ), '[]'::json),
          'recent_events', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT *
              FROM override_rows
              ORDER BY occurred_at DESC
              LIMIT 25
            ) t
          ), '[]'::json)
        ) AS report
      `,
      [input.clinicId, input.startDate, input.endDate]
    );

    return (result.rows[0] as { report?: unknown } | undefined)?.report ?? null;
  };
}
