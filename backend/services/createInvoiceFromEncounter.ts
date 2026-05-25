import type { CreateInvoiceFromEncounterInput, CreateInvoiceInput } from '../api/types.ts';
import { createInvoice } from './createInvoice.ts';

export function createInvoiceFromEncounter(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: CreateInvoiceFromEncounterInput) {
    const encounter = await db.query<{ id: string; patient_id: string; clinic_id: string }>(
      `
        SELECT e.id, e.patient_id, p.clinic_id
        FROM encounters e
        JOIN patients p ON p.id = e.patient_id
        WHERE e.id = $1
          AND e.patient_id = $2
          AND p.clinic_id = $3
          AND e.deleted_at IS NULL
      `,
      [input.encounterId, input.patientId, input.clinicId]
    );
    if (!encounter.rows[0]) return null;

    const templates = await db.query<{
      code: string;
      description: string;
      item_type: CreateInvoiceInput['lineItems'][number]['itemType'];
      unit_price_amount: string;
      tax_amount: string;
    }>(
      `
        SELECT code, description, item_type, unit_price_amount, tax_amount
        FROM charge_templates
        WHERE clinic_id = $1
          AND is_active = TRUE
          AND deleted_at IS NULL
      `,
      [input.clinicId]
    );
    const templateByCode = new Map(templates.rows.map((template) => [template.code.toUpperCase(), template]));
    const lineItems: CreateInvoiceInput['lineItems'] = [];

    if (input.includeVisitCharge ?? true) {
      const visit = templateByCode.get('VISIT');
      lineItems.push({
        itemType: 'visit',
        description: visit?.description ?? 'Visit charge',
        quantity: 1,
        unitPriceAmount: visit?.unit_price_amount ?? 0,
        taxAmount: visit?.tax_amount ?? 0,
      });
    }

    if (input.includePrescriptions ?? true) {
      const medicationTemplate = templateByCode.get('MEDICATION');
      const prescriptions = await db.query<{ id: string; medication_name: string }>(
        `
          SELECT id, medication_name
          FROM prescriptions
          WHERE encounter_id = $1
            AND deleted_at IS NULL
            AND status <> 'cancelled'
          ORDER BY created_at ASC
        `,
        [input.encounterId]
      );
      for (const prescription of prescriptions.rows) {
        lineItems.push({
          itemType: 'medication',
          description: prescription.medication_name,
          referenceType: 'prescription',
          referenceId: prescription.id,
          quantity: 1,
          unitPriceAmount: medicationTemplate?.unit_price_amount ?? 0,
          taxAmount: medicationTemplate?.tax_amount ?? 0,
        });
      }
    }

    if (lineItems.length === 0) {
      lineItems.push({ itemType: 'other', description: 'Encounter charge', quantity: 1, unitPriceAmount: 0 });
    }

    return createInvoice(db)({
      clinicId: input.clinicId,
      patientId: input.patientId,
      encounterId: input.encounterId,
      invoiceNumber: input.invoiceNumber,
      status: 'draft',
      receiptNumber: input.receiptNumber,
      taxInvoiceNumber: input.taxInvoiceNumber,
      notes: input.notes,
      lineItems,
    });
  };
}
