export function getPrinterBridgeHealthReport(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string; startDate: string; endDate: string }) {
    const result = await db.query(
      `
        WITH print_jobs AS (
          SELECT
            j.id,
            j.requested_at,
            j.printer_profile_id,
            p.profile_name,
            j.label_template_id,
            t.template_name,
            j.printer_language,
            j.connection_type,
            j.delivery_status,
            COALESCE(j.fallback_status, 'none') AS fallback_status,
            j.label_count,
            COALESCE(j.delivery_attempt_count, 0) AS delivery_attempt_count,
            j.last_delivery_error,
            j.fallback_reason,
            j.target_endpoint,
            j.delivery_updated_at,
            j.delivered_at
          FROM inventory_barcode_print_jobs j
          LEFT JOIN inventory_printer_profiles p ON p.id = j.printer_profile_id
          LEFT JOIN inventory_barcode_label_templates t ON t.id = j.label_template_id
          WHERE j.clinic_id = $1
            AND j.requested_at >= $2::date
            AND j.requested_at < ($3::date + INTERVAL '1 day')
            AND j.deleted_at IS NULL
        ),
        problem_jobs AS (
          SELECT *
          FROM print_jobs
          WHERE delivery_status IN ('failed', 'queued', 'printing')
             OR fallback_status IN ('browser_export', 'manual_print', 'retry_queued')
        )
        SELECT json_build_object(
          'start_date', $2,
          'end_date', $3,
          'print_job_total', (SELECT COUNT(*) FROM print_jobs),
          'label_total', COALESCE((SELECT SUM(label_count) FROM print_jobs), 0),
          'queued_total', (SELECT COUNT(*) FROM print_jobs WHERE delivery_status = 'queued'),
          'printing_total', (SELECT COUNT(*) FROM print_jobs WHERE delivery_status = 'printing'),
          'delivered_total', (SELECT COUNT(*) FROM print_jobs WHERE delivery_status = 'delivered'),
          'failed_total', (SELECT COUNT(*) FROM print_jobs WHERE delivery_status = 'failed'),
          'cancelled_total', (SELECT COUNT(*) FROM print_jobs WHERE delivery_status = 'cancelled'),
          'exported_total', (SELECT COUNT(*) FROM print_jobs WHERE delivery_status = 'exported'),
          'fallback_total', (SELECT COUNT(*) FROM print_jobs WHERE fallback_status <> 'none'),
          'browser_fallback_total', (SELECT COUNT(*) FROM print_jobs WHERE fallback_status = 'browser_export'),
          'manual_print_total', (SELECT COUNT(*) FROM print_jobs WHERE fallback_status = 'manual_print'),
          'retry_queued_total', (SELECT COUNT(*) FROM print_jobs WHERE fallback_status = 'retry_queued'),
          'avg_attempt_count', COALESCE((SELECT ROUND(AVG(delivery_attempt_count)::numeric, 2) FROM print_jobs), 0),
          'by_delivery_status', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT delivery_status, COUNT(*)::int AS count
              FROM print_jobs
              GROUP BY delivery_status
              ORDER BY delivery_status ASC
            ) t
          ), '[]'::json),
          'by_connection_type', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT COALESCE(connection_type::text, 'unknown') AS connection_type, COUNT(*)::int AS count
              FROM print_jobs
              GROUP BY connection_type
              ORDER BY count DESC, connection_type ASC
            ) t
          ), '[]'::json),
          'by_printer_profile', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT
                printer_profile_id,
                COALESCE(profile_name, 'Manual export') AS profile_name,
                COUNT(*)::int AS count,
                COUNT(*) FILTER (WHERE delivery_status = 'failed')::int AS failed_count,
                COUNT(*) FILTER (WHERE fallback_status <> 'none')::int AS fallback_count
              FROM print_jobs
              GROUP BY printer_profile_id, profile_name
              ORDER BY failed_count DESC, fallback_count DESC, count DESC, profile_name ASC
              LIMIT 10
            ) t
          ), '[]'::json),
          'recent_problem_jobs', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT
                id,
                requested_at,
                profile_name,
                template_name,
                printer_language,
                connection_type,
                delivery_status,
                fallback_status,
                delivery_attempt_count,
                last_delivery_error,
                fallback_reason,
                target_endpoint
              FROM problem_jobs
              ORDER BY requested_at DESC
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
