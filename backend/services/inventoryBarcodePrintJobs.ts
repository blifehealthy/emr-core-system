import type {
  CreateInventoryBarcodePrintJobInput,
  InventoryBarcodePrintDeliveryStatus,
  InventoryPrinterConnectionType,
  UpdateInventoryBarcodePrintJobDeliveryInput,
} from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

type BarcodeLabel = CreateInventoryBarcodePrintJobInput['labels'][number];
type PrinterProfile = {
  id: string;
  printer_language: CreateInventoryBarcodePrintJobInput['printerLanguage'];
  connection_type: 'browser' | 'network' | 'utility_bridge';
  endpoint_url: string | null;
};
type LabelTemplate = {
  id: string;
  printer_language: CreateInventoryBarcodePrintJobInput['printerLanguage'];
  enabled_fields: string[] | string;
  header_text: string | null;
  footer_text: string | null;
};

export function createInventoryBarcodePrintJob(db: Db) {
  return async function run(input: CreateInventoryBarcodePrintJobInput) {
    const printerProfile = input.printerProfileId
      ? await findPrinterProfile(db, input.clinicId, input.printerProfileId)
      : null;
    if (input.printerProfileId && !printerProfile) return null;
    const labelTemplate = input.labelTemplateId
      ? await findLabelTemplate(db, input.clinicId, input.labelTemplateId)
      : null;
    if (input.labelTemplateId && !labelTemplate) return null;

    const printerLanguage =
      input.printerLanguage ?? printerProfile?.printer_language ?? labelTemplate?.printer_language ?? 'html';
    const connectionType = printerProfile?.connection_type ?? 'browser';
    const deliveryStatus = connectionType === 'browser' ? 'exported' : 'queued';
    const labels = applyLabelTemplate(input.labels, labelTemplate);
    const renderedPayload = renderBarcodePayload(labels, printerLanguage);
    const result = await db.query(
      `
        INSERT INTO inventory_barcode_print_jobs (
          clinic_id,
          printer_profile_id,
          label_template_id,
          printer_language,
          connection_type,
          delivery_status,
          target_endpoint,
          label_count,
          rendered_payload,
          requested_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      [
        input.clinicId,
        printerProfile?.id ?? null,
        labelTemplate?.id ?? null,
        printerLanguage,
        connectionType,
        deliveryStatus,
        printerProfile?.endpoint_url ?? null,
        input.labels.length,
        renderedPayload,
        input.requestedByUserId ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}

export function listInventoryBarcodePrintJobs(db: Db) {
  return async function run(input: {
    clinicId: string;
    printerProfileId?: string;
    connectionType?: InventoryPrinterConnectionType;
    deliveryStatus?: InventoryBarcodePrintDeliveryStatus | 'all';
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];

    if (input.printerProfileId) {
      params.push(input.printerProfileId);
      conditions.push(`printer_profile_id = $${params.length}`);
    }

    if (input.connectionType) {
      params.push(input.connectionType);
      conditions.push(`connection_type = $${params.length}`);
    }

    if (input.deliveryStatus && input.deliveryStatus !== 'all') {
      params.push(input.deliveryStatus);
      conditions.push(`delivery_status = $${params.length}`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT *
        FROM inventory_barcode_print_jobs
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY requested_at ASC, created_at ASC
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

export function updateInventoryBarcodePrintJobDelivery(db: Db) {
  return async function run(input: UpdateInventoryBarcodePrintJobDeliveryInput) {
    const deliveredAt =
      input.deliveryStatus === 'delivered'
        ? input.deliveredAt ?? new Date().toISOString()
        : input.deliveredAt ?? null;
    const result = await db.query(
      `
        UPDATE inventory_barcode_print_jobs
        SET delivery_status = $2,
            delivery_attempt_count = delivery_attempt_count + 1,
            last_delivery_error = $3,
            delivery_updated_by_user_id = $4,
            delivery_updated_at = now(),
            delivered_at = $5
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      [
        input.printJobId,
        input.deliveryStatus,
        input.deliveryError ?? null,
        input.updatedByUserId ?? null,
        deliveredAt,
      ]
    );

    return result.rows[0] ?? null;
  };
}

async function findPrinterProfile(db: Db, clinicId: string, printerProfileId: string) {
  const result = await db.query<PrinterProfile>(
    `
      SELECT id, printer_language, connection_type, endpoint_url
      FROM inventory_printer_profiles
      WHERE id = $1
        AND clinic_id = $2
        AND is_active IS TRUE
        AND deleted_at IS NULL
    `,
    [printerProfileId, clinicId]
  );
  return result.rows[0] ?? null;
}

async function findLabelTemplate(db: Db, clinicId: string, labelTemplateId: string) {
  const result = await db.query<LabelTemplate>(
    `
      SELECT id, printer_language, enabled_fields, header_text, footer_text
      FROM inventory_barcode_label_templates
      WHERE id = $1
        AND clinic_id = $2
        AND is_active IS TRUE
        AND deleted_at IS NULL
    `,
    [labelTemplateId, clinicId]
  );
  return result.rows[0] ?? null;
}

function applyLabelTemplate(labels: BarcodeLabel[], template: LabelTemplate | null) {
  if (!template) return labels;
  const fields = new Set(
    (Array.isArray(template.enabled_fields)
      ? template.enabled_fields
      : JSON.parse(template.enabled_fields || '[]')) as string[]
  );
  return labels.map((label) => ({
    type: label.type,
    title:
      (fields.has('title')
        ? [template.header_text, label.title].filter(Boolean).join(' - ')
        : template.header_text) || label.barcode,
    subtitle: fields.has('subtitle') ? label.subtitle : null,
    barcode: label.barcode,
    detail: [
      fields.has('detail') ? label.detail : '',
      fields.has('type') ? label.type : '',
      template.footer_text,
    ].filter(Boolean).join(' | ') || null,
  }));
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
