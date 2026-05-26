export function getControlledSubstanceRegister(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string; startDate: string; endDate: string }) {
    const result = await db.query(
      `
        WITH controlled_items AS (
          SELECT id, display_name, item_code, controlled_substance_schedule
          FROM inventory_items
          WHERE clinic_id = $1
            AND is_controlled_substance IS TRUE
            AND deleted_at IS NULL
        ),
        register_rows AS (
          SELECT
            'receive' AS event_type,
            l.id,
            l.received_at AS occurred_at,
            l.inventory_item_id,
            i.display_name AS inventory_item_display_name,
            i.item_code AS inventory_item_code,
            i.controlled_substance_schedule,
            l.id AS inventory_lot_id,
            l.lot_number AS inventory_lot_number,
            l.inventory_location_id,
            loc.display_name AS inventory_location_display_name,
            l.bin_label,
            l.received_quantity AS quantity,
            'in' AS direction,
            l.received_by_user_id AS actor_user_id,
            NULL::uuid AS witness_user_id,
            NULL::timestamptz AS witnessed_at,
            NULL::text AS witness_note,
            l.reference_number,
            l.notes
          FROM inventory_lots l
          JOIN controlled_items i ON i.id = l.inventory_item_id
          LEFT JOIN inventory_locations loc ON loc.id = l.inventory_location_id
          WHERE l.received_at >= $2::date
            AND l.received_at < ($3::date + INTERVAL '1 day')
            AND l.deleted_at IS NULL
          UNION ALL
          SELECT
            'dispense' AS event_type,
            d.id,
            d.dispensed_at AS occurred_at,
            d.inventory_item_id,
            i.display_name AS inventory_item_display_name,
            i.item_code AS inventory_item_code,
            i.controlled_substance_schedule,
            d.inventory_lot_id,
            lot.lot_number AS inventory_lot_number,
            d.inventory_location_id,
            loc.display_name AS inventory_location_display_name,
            NULL::text AS bin_label,
            d.quantity,
            'out' AS direction,
            d.dispensed_by_user_id AS actor_user_id,
            d.witness_user_id,
            d.witnessed_at,
            d.witness_note,
            d.prescription_id::text AS reference_number,
            d.notes
          FROM medication_dispenses d
          JOIN controlled_items i ON i.id = d.inventory_item_id
          LEFT JOIN inventory_lots lot ON lot.id = d.inventory_lot_id
          LEFT JOIN inventory_locations loc ON loc.id = d.inventory_location_id
          WHERE d.dispensed_at >= $2::date
            AND d.dispensed_at < ($3::date + INTERVAL '1 day')
            AND d.deleted_at IS NULL
          UNION ALL
          SELECT
            'transfer' AS event_type,
            t.id,
            COALESCE(t.received_at, t.approved_at, t.requested_at, t.transferred_at, t.created_at) AS occurred_at,
            t.inventory_item_id,
            i.display_name AS inventory_item_display_name,
            i.item_code AS inventory_item_code,
            i.controlled_substance_schedule,
            t.inventory_lot_id,
            lot.lot_number AS inventory_lot_number,
            t.to_inventory_location_id AS inventory_location_id,
            to_loc.display_name AS inventory_location_display_name,
            t.to_bin_label AS bin_label,
            t.quantity,
            'transfer' AS direction,
            COALESCE(t.received_by_user_id, t.approved_by_user_id, t.requested_by_user_id, t.transferred_by_user_id) AS actor_user_id,
            NULL::uuid AS witness_user_id,
            NULL::timestamptz AS witnessed_at,
            NULL::text AS witness_note,
            t.status::text AS reference_number,
            CONCAT_WS(' -> ', from_loc.display_name, to_loc.display_name) AS notes
          FROM inventory_transfers t
          JOIN controlled_items i ON i.id = t.inventory_item_id
          LEFT JOIN inventory_lots lot ON lot.id = t.inventory_lot_id
          LEFT JOIN inventory_locations from_loc ON from_loc.id = t.from_inventory_location_id
          LEFT JOIN inventory_locations to_loc ON to_loc.id = t.to_inventory_location_id
          WHERE COALESCE(t.received_at, t.approved_at, t.requested_at, t.transferred_at, t.created_at) >= $2::date
            AND COALESCE(t.received_at, t.approved_at, t.requested_at, t.transferred_at, t.created_at) < ($3::date + INTERVAL '1 day')
            AND t.deleted_at IS NULL
            AND t.status <> 'cancelled'
        )
        SELECT json_build_object(
          'start_date', $2,
          'end_date', $3,
          'controlled_item_total', (SELECT COUNT(*) FROM controlled_items),
          'event_total', (SELECT COUNT(*) FROM register_rows),
          'received_total', COALESCE((SELECT SUM(quantity) FROM register_rows WHERE event_type = 'receive'), 0),
          'dispensed_total', COALESCE((SELECT SUM(quantity) FROM register_rows WHERE event_type = 'dispense'), 0),
          'transfer_total', COALESCE((SELECT SUM(quantity) FROM register_rows WHERE event_type = 'transfer'), 0),
          'by_event_type', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT event_type, COUNT(*)::int AS count, SUM(quantity) AS quantity
              FROM register_rows
              GROUP BY event_type
              ORDER BY event_type ASC
            ) t
          ), '[]'::json),
          'by_item', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT
                inventory_item_id,
                inventory_item_display_name,
                inventory_item_code,
                controlled_substance_schedule,
                COUNT(*)::int AS count,
                SUM(CASE WHEN direction = 'in' THEN quantity ELSE 0 END) AS received_quantity,
                SUM(CASE WHEN direction = 'out' THEN quantity ELSE 0 END) AS dispensed_quantity,
                SUM(CASE WHEN direction = 'transfer' THEN quantity ELSE 0 END) AS transfer_quantity
              FROM register_rows
              GROUP BY inventory_item_id, inventory_item_display_name, inventory_item_code, controlled_substance_schedule
              ORDER BY count DESC, inventory_item_display_name ASC
              LIMIT 25
            ) t
          ), '[]'::json),
          'recent_events', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT *
              FROM register_rows
              ORDER BY occurred_at DESC
              LIMIT 50
            ) t
          ), '[]'::json)
        ) AS report
      `,
      [input.clinicId, input.startDate, input.endDate]
    );

    return (result.rows[0] as { report?: unknown } | undefined)?.report ?? null;
  };
}
