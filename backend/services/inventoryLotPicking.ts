type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

type LotPickInput = {
  clinicId: string;
  inventoryItemId: string;
  inventoryLotId: string;
  quantity: number;
  inventoryLocationId?: string | null;
  binLabel?: string | null;
  expiryOverrideReason?: string | null;
  fefoOverrideReason?: string | null;
};

type LotPickResult = {
  selectedLot: {
    id: string;
    lot_number: string;
    expires_on: string | null;
    inventory_location_id: string | null;
    bin_label: string | null;
    quantity_on_hand: string | number;
    expired: boolean;
  };
  fefoRecommendedLotId: string | null;
};

export async function assertInventoryLotPickAllowed(
  db: Db,
  input: LotPickInput
): Promise<LotPickResult | null> {
  const selected = await db.query<LotPickResult['selectedLot']>(
    `
      SELECT
        id,
        lot_number,
        expires_on,
        inventory_location_id,
        bin_label,
        quantity_on_hand,
        (expires_on IS NOT NULL AND expires_on < CURRENT_DATE) AS expired
      FROM inventory_lots
      WHERE id = $1
        AND clinic_id = $2
        AND inventory_item_id = $3
        AND deleted_at IS NULL
    `,
    [input.inventoryLotId, input.clinicId, input.inventoryItemId]
  );
  const selectedLot = selected.rows[0];
  if (!selectedLot) return null;

  if (selectedLot.expired && !input.expiryOverrideReason?.trim()) {
    throw new Error('Inventory lot is expired; expiryOverrideReason is required');
  }

  const params: unknown[] = [
    input.clinicId,
    input.inventoryItemId,
    input.quantity,
    input.inventoryLotId,
    selectedLot.expires_on,
  ];
  const conditions = [
    'l.clinic_id = $1',
    'l.inventory_item_id = $2',
    'l.quantity_on_hand >= $3',
    'l.id <> $4',
    'l.deleted_at IS NULL',
    '(l.expires_on IS NULL OR l.expires_on >= CURRENT_DATE)',
    `(
      ($5::date IS NULL AND l.expires_on IS NOT NULL)
      OR ($5::date IS NOT NULL AND l.expires_on IS NOT NULL AND l.expires_on < $5::date)
    )`,
  ];

  const scopedLocationId = input.inventoryLocationId ?? selectedLot.inventory_location_id;
  if (scopedLocationId) {
    params.push(scopedLocationId);
    conditions.push(`l.inventory_location_id = $${params.length}`);
  }
  const scopedBinLabel = input.binLabel ?? selectedLot.bin_label;
  if (scopedBinLabel) {
    params.push(scopedBinLabel);
    conditions.push(`COALESCE(l.bin_label, '') = COALESCE($${params.length}, '')`);
  }

  const better = await db.query<{ id: string; lot_number: string }>(
    `
      SELECT id, lot_number
      FROM inventory_lots l
      WHERE ${conditions.join('\n        AND ')}
      ORDER BY l.expires_on NULLS LAST, l.received_at ASC, l.created_at ASC
      LIMIT 1
    `,
    params
  );
  const recommendedLot = better.rows[0] ?? null;
  if (recommendedLot && !input.fefoOverrideReason?.trim()) {
    throw new Error(`FEFO recommended lot is ${recommendedLot.lot_number}; fefoOverrideReason is required`);
  }

  return {
    selectedLot,
    fefoRecommendedLotId: recommendedLot?.id ?? null,
  };
}
