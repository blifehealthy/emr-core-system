import type { CreateInventoryBarcodePrintJobInput } from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

type BarcodeLabel = CreateInventoryBarcodePrintJobInput['labels'][number];

export function createInventoryBarcodePrintJob(db: Db) {
  return async function run(input: CreateInventoryBarcodePrintJobInput) {
    const printerLanguage = input.printerLanguage ?? 'html';
    const renderedPayload = renderBarcodePayload(input.labels, printerLanguage);
    const result = await db.query(
      `
        INSERT INTO inventory_barcode_print_jobs (
          clinic_id,
          printer_language,
          label_count,
          rendered_payload,
          requested_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        input.clinicId,
        printerLanguage,
        input.labels.length,
        renderedPayload,
        input.requestedByUserId ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}

export function renderBarcodePayload(
  labels: BarcodeLabel[],
  printerLanguage: CreateInventoryBarcodePrintJobInput['printerLanguage'] = 'html'
) {
  if (printerLanguage === 'zpl') return renderZpl(labels);
  if (printerLanguage === 'escpos') return renderEscPos(labels);
  return renderPlainHtml(labels);
}

function renderZpl(labels: BarcodeLabel[]) {
  return labels
    .map((label) => {
      const title = sanitizePrinterText(label.title);
      const subtitle = sanitizePrinterText(label.subtitle ?? '');
      const detail = sanitizePrinterText(label.detail ?? '');
      const barcode = sanitizePrinterText(label.barcode);
      return [
        '^XA',
        '^CI28',
        `^FO30,24^A0N,28,28^FD${title}^FS`,
        `^FO30,58^A0N,20,20^FD${subtitle}^FS`,
        `^FO30,88^BY2,2,62^BCN,62,Y,N,N^FD${barcode}^FS`,
        `^FO30,176^A0N,18,18^FD${detail}^FS`,
        '^XZ',
      ].join('\n');
    })
    .join('\n');
}

function renderEscPos(labels: BarcodeLabel[]) {
  return labels
    .map((label) =>
      [
        '\x1B@',
        `${label.type ?? 'LABEL'}\n`,
        `${label.title}\n`,
        `${label.subtitle ?? ''}\n`,
        `[BARCODE:${label.barcode}]\n`,
        `${label.detail ?? ''}\n`,
        '\n\x1DV\x00',
      ].join('')
    )
    .join('');
}

function renderPlainHtml(labels: BarcodeLabel[]) {
  return labels
    .map((label) =>
      [
        `${label.type ?? 'LABEL'}: ${label.title}`,
        label.subtitle ?? '',
        label.barcode,
        label.detail ?? '',
      ].filter(Boolean).join('\n')
    )
    .join('\n\n');
}

function sanitizePrinterText(value: string) {
  return value.replace(/[\^~]/g, ' ').trim();
}
