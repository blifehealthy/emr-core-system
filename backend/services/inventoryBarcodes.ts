import type { ScanInventoryBarcodeInput } from '../api/types.ts';
import { parseGs1Barcode } from './gs1Barcodes.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

type BarcodeMatchRow = {
  inventory_item_id: string | null;
  inventory_lot_id: string | null;
  inventory_item_display_name: string | null;
  inventory_item_code: string | null;
  inventory_item_barcode: string | null;
  inventory_lot_number: string | null;
  inventory_lot_barcode: string | null;
  inventory_lot_expires_on: string | null;
};

export function scanInventoryBarcode(db: Db) {
  return async function run(input: ScanInventoryBarcodeInput): Promise<Record<string, unknown>> {
    const parsedGs1 = parseGs1Barcode(input.barcode);
    const matchResult = await db.query<BarcodeMatchRow>(
      `
        SELECT *
        FROM (
          SELECT
            i.id AS inventory_item_id,
            NULL::uuid AS inventory_lot_id,
            i.display_name AS inventory_item_display_name,
            i.item_code AS inventory_item_code,
            i.barcode AS inventory_item_barcode,
            NULL::varchar AS inventory_lot_number,
            NULL::varchar AS inventory_lot_barcode,
            NULL::date AS inventory_lot_expires_on,
            1 AS match_rank
          FROM inventory_items i
          WHERE i.clinic_id = $1
            AND (i.barcode = $2 OR ($3::text IS NOT NULL AND i.barcode = $3))
            AND i.deleted_at IS NULL
          UNION ALL
          SELECT
            l.inventory_item_id,
            l.id AS inventory_lot_id,
            i.display_name AS inventory_item_display_name,
            i.item_code AS inventory_item_code,
            i.barcode AS inventory_item_barcode,
            l.lot_number AS inventory_lot_number,
            l.barcode AS inventory_lot_barcode,
            l.expires_on AS inventory_lot_expires_on,
            0 AS match_rank
          FROM inventory_lots l
          JOIN inventory_items i ON i.id = l.inventory_item_id
          WHERE l.clinic_id = $1
            AND (
              l.barcode = $2
              OR ($3::text IS NOT NULL AND i.barcode = $3)
              OR ($4::text IS NOT NULL AND l.lot_number = $4)
              OR ($4::text IS NOT NULL AND l.barcode = $4)
            )
            AND l.deleted_at IS NULL
            AND i.deleted_at IS NULL
        ) matches
        ORDER BY match_rank ASC
        LIMIT 1
      `,
      [input.clinicId, input.barcode, parsedGs1.gtin, parsedGs1.lotNumber]
    );
    const match = matchResult.rows[0] ?? null;

    const scanResult = await db.query<Record<string, unknown>>(
      `
        INSERT INTO inventory_barcode_scans (
          clinic_id,
          barcode,
          scan_context,
          inventory_item_id,
          inventory_lot_id,
          matched,
          gs1_gtin,
          gs1_lot_number,
          gs1_expires_on,
          gs1_serial_number,
          scanned_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `,
      [
        input.clinicId,
        input.barcode,
        input.scanContext ?? 'lookup',
        match?.inventory_item_id ?? null,
        match?.inventory_lot_id ?? null,
        Boolean(match),
        parsedGs1.gtin,
        parsedGs1.lotNumber,
        parsedGs1.expiresOn,
        parsedGs1.serialNumber,
        input.scannedByUserId ?? null,
        input.notes ?? null,
      ]
    );

    const scanRow = scanResult.rows[0] ?? {};
    return {
      ...scanRow,
      gs1_gtin: parsedGs1.gtin,
      gs1_lot_number: parsedGs1.lotNumber,
      gs1_expires_on: parsedGs1.expiresOn,
      gs1_serial_number: parsedGs1.serialNumber,
      ...(match ?? {}),
    };
  };
}
