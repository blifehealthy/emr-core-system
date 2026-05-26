type Row = Record<string, unknown>;

function pickKeys(row: unknown, keys: string[]): Record<string, unknown> {
  if (!row || typeof row !== 'object') {
    return {};
  }

  const source = row as Row;
  const picked: Record<string, unknown> = {};

  for (const key of keys) {
    if (key in source) {
      picked[key] = source[key];
    }
  }

  return picked;
}

const DIAGNOSIS_KEYS = [
  'id',
  'encounter_id',
  'clinical_note_id',
  'diagnosis_code',
  'coding_system',
  'diagnosis_name',
  'diagnosis_type',
  'status',
  'sequence_number',
  'diagnosed_at',
  'resolution_note',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PATIENT_KEYS = [
  'id',
  'clinic_id',
  'medical_record_number',
  'national_id',
  'first_name',
  'middle_name',
  'last_name',
  'preferred_name',
  'date_of_birth',
  'sex_at_birth',
  'phone_number',
  'email',
  'blood_type',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const VITAL_SIGN_KEYS = [
  'id',
  'encounter_id',
  'clinical_note_id',
  'measured_at',
  'measured_by_practitioner_id',
  'body_temperature_c',
  'heart_rate_bpm',
  'respiratory_rate_bpm',
  'systolic_bp_mmhg',
  'diastolic_bp_mmhg',
  'oxygen_saturation_pct',
  'weight_kg',
  'height_cm',
  'bmi',
  'pain_score',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PRESCRIPTION_KEYS = [
  'id',
  'encounter_id',
  'clinical_note_id',
  'prescribed_by_practitioner_id',
  'drug_catalog_id',
  'medication_name',
  'rxnorm_code',
  'dosage',
  'route',
  'frequency',
  'duration_text',
  'instructions',
  'status',
  'start_date',
  'end_date',
  'safety_warnings',
  'safety_override_reason',
  'safety_overridden_at',
  'safety_overridden_by_user_id',
  'safety_overridden_by_practitioner_id',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVOICE_KEYS = [
  'id',
  'clinic_id',
  'patient_id',
  'appointment_id',
  'visit_id',
  'encounter_id',
  'invoice_number',
  'status',
  'currency',
  'subtotal_amount',
  'discount_amount',
  'tax_amount',
  'total_amount',
  'paid_amount',
  'refunded_amount',
  'balance_amount',
  'receipt_number',
  'tax_invoice_number',
  'receipt_issued_at',
  'issued_at',
  'due_at',
  'notes',
  'void_reason',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INSURANCE_CLAIM_KEYS = [
  'id',
  'clinic_id',
  'patient_id',
  'invoice_id',
  'claim_number',
  'status',
  'insurer_name',
  'policy_number',
  'approved_amount',
  'paid_amount',
  'submitted_at',
  'adjudicated_at',
  'rejection_reason',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVOICE_LINE_ITEM_KEYS = [
  'id',
  'invoice_id',
  'item_type',
  'description',
  'reference_type',
  'reference_id',
  'quantity',
  'unit_price_amount',
  'discount_amount',
  'tax_amount',
  'line_total_amount',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVOICE_PAYMENT_KEYS = [
  'id',
  'invoice_id',
  'payment_number',
  'method',
  'amount',
  'paid_at',
  'received_by_user_id',
  'reference_number',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVOICE_REFUND_KEYS = [
  'id',
  'invoice_id',
  'refund_number',
  'method',
  'amount',
  'refunded_at',
  'refunded_by_user_id',
  'reference_number',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const CHARGE_TEMPLATE_KEYS = [
  'id',
  'clinic_id',
  'code',
  'description',
  'item_type',
  'unit_price_amount',
  'tax_amount',
  'is_active',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const BILLING_NUMBER_SEQUENCE_KEYS = [
  'id',
  'clinic_id',
  'document_type',
  'prefix',
  'next_number',
  'padding',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const CASHIER_RECONCILIATION_KEYS = [
  'id',
  'clinic_id',
  'reconciliation_date',
  'status',
  'opening_cash_amount',
  'expected_cash_amount',
  'counted_cash_amount',
  'variance_amount',
  'opened_by_user_id',
  'closed_by_user_id',
  'opened_at',
  'closed_at',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const DRUG_CATALOG_KEYS = [
  'id',
  'clinic_id',
  'medication_name',
  'rxnorm_code',
  'generic_name',
  'strength',
  'dosage_form',
  'route',
  'allergen_tags',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const DRUG_INTERACTION_RULE_KEYS = [
  'id',
  'clinic_id',
  'primary_drug_catalog_id',
  'interacting_drug_catalog_id',
  'primary_rxnorm_code',
  'interacting_rxnorm_code',
  'primary_medication_name',
  'interacting_medication_name',
  'severity',
  'description',
  'recommendation',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVENTORY_ITEM_KEYS = [
  'id',
  'clinic_id',
  'drug_catalog_id',
  'item_code',
  'display_name',
  'barcode',
  'barcode_required',
  'is_controlled_substance',
  'controlled_substance_schedule',
  'unit',
  'quantity_on_hand',
  'reorder_level',
  'is_active',
  'notes',
  'drug_catalog_medication_name',
  'drug_catalog_rxnorm_code',
  'low_stock',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVENTORY_LOT_KEYS = [
  'id',
  'clinic_id',
  'inventory_item_id',
  'inventory_location_id',
  'supplier_id',
  'purchase_order_id',
  'purchase_order_line_id',
  'lot_number',
  'bin_label',
  'barcode',
  'received_barcode',
  'barcode_verified',
  'barcode_verified_at',
  'barcode_verified_by_user_id',
  'expires_on',
  'received_quantity',
  'quantity_on_hand',
  'received_at',
  'supplier_name',
  'reference_number',
  'received_by_user_id',
  'notes',
  'inventory_item_display_name',
  'inventory_item_code',
  'inventory_location_code',
  'inventory_location_display_name',
  'expired',
  'expiring_soon',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVENTORY_LOCATION_KEYS = [
  'id',
  'clinic_id',
  'location_code',
  'display_name',
  'location_type',
  'is_default',
  'is_active',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVENTORY_LOCATION_STOCK_KEYS = [
  'id',
  'clinic_id',
  'inventory_item_id',
  'inventory_location_id',
  'bin_label',
  'quantity_on_hand',
  'reorder_level',
  'inventory_item_display_name',
  'inventory_item_code',
  'inventory_location_code',
  'inventory_location_display_name',
  'low_stock',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVENTORY_TRANSFER_KEYS = [
  'id',
  'clinic_id',
  'inventory_item_id',
  'inventory_lot_id',
  'from_inventory_location_id',
  'to_inventory_location_id',
  'from_bin_label',
  'to_bin_label',
  'quantity',
  'status',
  'transferred_at',
  'requested_at',
  'requested_by_user_id',
  'approved_at',
  'approved_by_user_id',
  'received_at',
  'received_by_user_id',
  'cancelled_at',
  'cancelled_by_user_id',
  'cancellation_reason',
  'expiry_override_reason',
  'fefo_override_reason',
  'fefo_recommended_lot_id',
  'transferred_by_user_id',
  'notes',
  'inventory_item_display_name',
  'inventory_item_code',
  'inventory_lot_number',
  'inventory_lot_expires_on',
  'from_inventory_location_display_name',
  'from_inventory_location_code',
  'to_inventory_location_display_name',
  'to_inventory_location_code',
  'created_at',
  'deleted_at',
] as const;

const SUPPLIER_KEYS = [
  'id',
  'clinic_id',
  'supplier_code',
  'display_name',
  'contact_name',
  'phone_number',
  'email',
  'address',
  'status',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PURCHASE_ORDER_LINE_KEYS = [
  'id',
  'purchase_order_id',
  'inventory_item_id',
  'description',
  'ordered_quantity',
  'received_quantity',
  'unit_price_amount',
  'notes',
  'inventory_item_display_name',
  'inventory_item_code',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PURCHASE_ORDER_APPROVAL_STEP_KEYS = [
  'id',
  'purchase_order_id',
  'policy_id',
  'approval_sequence',
  'required_role',
  'status',
  'approved_at',
  'approved_by_user_id',
  'rejected_at',
  'rejected_by_user_id',
  'rejection_reason',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PURCHASE_ORDER_APPROVAL_POLICY_KEYS = [
  'id',
  'clinic_id',
  'policy_name',
  'min_total_amount',
  'max_total_amount',
  'approval_sequence',
  'required_role',
  'is_active',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PURCHASE_ORDER_KEYS = [
  'id',
  'clinic_id',
  'supplier_id',
  'purchase_order_number',
  'status',
  'approval_status',
  'ordered_at',
  'expected_at',
  'received_at',
  'created_by_user_id',
  'submitted_at',
  'submitted_by_user_id',
  'approved_at',
  'approved_by_user_id',
  'rejected_at',
  'rejected_by_user_id',
  'rejection_reason',
  'notes',
  'supplier_display_name',
  'supplier_code',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const STOCK_MOVEMENT_KEYS = [
  'id',
  'clinic_id',
  'inventory_item_id',
  'inventory_lot_id',
  'inventory_location_id',
  'prescription_id',
  'medication_dispense_id',
  'movement_type',
  'quantity',
  'quantity_before',
  'quantity_after',
  'reason',
  'bin_label',
  'scanned_barcode',
  'barcode_verified',
  'performed_by_user_id',
  'moved_at',
  'inventory_item_display_name',
  'inventory_item_code',
  'inventory_lot_number',
  'inventory_lot_expires_on',
  'inventory_location_code',
  'inventory_location_display_name',
  'created_at',
  'deleted_at',
] as const;

const MEDICATION_DISPENSE_KEYS = [
  'id',
  'clinic_id',
  'prescription_id',
  'inventory_item_id',
  'inventory_lot_id',
  'inventory_location_id',
  'status',
  'quantity',
  'scanned_barcode',
  'barcode_verified',
  'barcode_verified_at',
  'expiry_override_reason',
  'fefo_override_reason',
  'fefo_recommended_lot_id',
  'dispensed_at',
  'dispensed_by_user_id',
  'witness_user_id',
  'witnessed_at',
  'witness_note',
  'notes',
  'inventory_item_display_name',
  'inventory_item_code',
  'inventory_lot_number',
  'inventory_lot_expires_on',
  'inventory_location_code',
  'inventory_location_display_name',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const INVENTORY_BARCODE_SCAN_KEYS = [
  'id',
  'clinic_id',
  'barcode',
  'scan_context',
  'inventory_item_id',
  'inventory_lot_id',
  'matched',
  'scanned_by_user_id',
  'scanned_at',
  'notes',
  'inventory_item_display_name',
  'inventory_item_code',
  'inventory_item_barcode',
  'inventory_lot_number',
  'inventory_lot_barcode',
  'inventory_lot_expires_on',
  'created_at',
  'deleted_at',
] as const;

const INVENTORY_BARCODE_PRINT_JOB_KEYS = [
  'id',
  'clinic_id',
  'printer_profile_id',
  'printer_language',
  'connection_type',
  'delivery_status',
  'target_endpoint',
  'label_count',
  'rendered_payload',
  'requested_by_user_id',
  'requested_at',
  'notes',
  'created_at',
  'deleted_at',
] as const;

const INVENTORY_PRINTER_PROFILE_KEYS = [
  'id',
  'clinic_id',
  'profile_name',
  'printer_language',
  'connection_type',
  'endpoint_url',
  'location_name',
  'is_default',
  'is_active',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const USER_KEYS = [
  'id',
  'clinic_id',
  'username',
  'display_name',
  'role',
  'oidc_subject',
  'last_login_at',
  'failed_login_count',
  'locked_until',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PRACTITIONER_KEYS = [
  'id',
  'clinic_id',
  'user_id',
  'practitioner_code',
  'first_name',
  'last_name',
  'license_number',
  'specialty',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const APPOINTMENT_KEYS = [
  'id',
  'clinic_id',
  'patient_id',
  'practitioner_id',
  'appointment_number',
  'status',
  'scheduled_start_at',
  'scheduled_end_at',
  'reason',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const CLINIC_VISIT_KEYS = [
  'id',
  'clinic_id',
  'patient_id',
  'appointment_id',
  'encounter_id',
  'practitioner_id',
  'visit_number',
  'status',
  'queue_label',
  'room_name',
  'checked_in_at',
  'called_at',
  'started_at',
  'completed_at',
  'discharged_at',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
  'medical_record_number',
  'patient_first_name',
  'patient_last_name',
  'practitioner_first_name',
  'practitioner_last_name',
] as const;

const CLINICAL_NOTE_TEMPLATE_KEYS = [
  'id',
  'clinic_id',
  'template_key',
  'title',
  'category',
  'subjective',
  'objective',
  'assessment',
  'plan',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const CLINIC_SETTINGS_KEYS = [
  'clinic_id',
  'display_name',
  'address',
  'phone_number',
  'email',
  'website',
  'logo_url',
  'logo_file_asset_id',
  'prescription_footer',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const ENCOUNTER_KEYS = [
  'id',
  'patient_id',
  'encounter_number',
  'status',
  'encounter_class',
  'appointment_id',
  'attending_practitioner_id',
  'chief_complaint',
  'triage_summary',
  'started_at',
  'ended_at',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const CONSENT_RECORD_KEYS = [
  'id',
  'clinic_id',
  'patient_id',
  'consent_type',
  'status',
  'granted_at',
  'revoked_at',
  'expires_at',
  'captured_by_user_id',
  'document_reference',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const FILE_ASSET_KEYS = [
  'id',
  'clinic_id',
  'storage_key',
  'original_filename',
  'mime_type',
  'byte_size',
  'checksum_sha256',
  'uploaded_by_user_id',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const ATTACHMENT_LINK_KEYS = [
  'id',
  'file_asset_id',
  'target_type',
  'target_id',
  'label',
  'created_at',
  'updated_at',
  'deleted_at',
  'clinic_id',
  'storage_key',
  'original_filename',
  'mime_type',
  'byte_size',
  'checksum_sha256',
  'uploaded_by_user_id',
] as const;

const PATIENT_ALLERGY_KEYS = [
  'id',
  'patient_id',
  'allergen_name',
  'allergen_category',
  'reaction',
  'severity',
  'status',
  'criticality',
  'recorded_at',
  'last_occurrence_at',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PATIENT_CONDITION_KEYS = [
  'id',
  'patient_id',
  'condition_code',
  'coding_system',
  'condition_name',
  'clinical_status',
  'onset_date',
  'abatement_date',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PATIENT_MEDICATION_KEYS = [
  'id',
  'patient_id',
  'prescribed_by_practitioner_id',
  'medication_name',
  'rxnorm_code',
  'dosage',
  'route',
  'frequency',
  'instructions',
  'status',
  'start_date',
  'end_date',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PATIENT_FLAG_KEYS = [
  'id',
  'patient_id',
  'flag_type',
  'label',
  'description',
  'severity',
  'status',
  'source',
  'starts_at',
  'ends_at',
  'created_by_user_id',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const SOAP_NOTE_KEYS = [
  'clinical_note_id',
  'subjective',
  'objective',
  'assessment',
  'plan',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

export function toDiagnosisDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...DIAGNOSIS_KEYS]);
}

export function toPatientDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_KEYS]);
}

export function toDiagnosisDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toDiagnosisDto(row));
}

export function toVitalSignDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...VITAL_SIGN_KEYS]);
}

export function toVitalSignDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toVitalSignDto(row));
}

export function toPrescriptionDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PRESCRIPTION_KEYS]);
}

export function toPrescriptionDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPrescriptionDto(row));
}

export function toInvoiceDto(row: unknown): Record<string, unknown> {
  const invoice = pickKeys(row, [...INVOICE_KEYS]);
  if (row && typeof row === 'object') {
    const source = row as Row;
    if (Array.isArray(source.line_items)) {
      invoice.line_items = source.line_items.map((item) =>
        pickKeys(item, [...INVOICE_LINE_ITEM_KEYS])
      );
    }
    if (Array.isArray(source.payments)) {
      invoice.payments = source.payments.map((payment) =>
        pickKeys(payment, [...INVOICE_PAYMENT_KEYS])
      );
    }
    if (Array.isArray(source.refunds)) {
      invoice.refunds = source.refunds.map((refund) =>
        pickKeys(refund, [...INVOICE_REFUND_KEYS])
      );
    }
  }
  return invoice;
}

export function toInvoiceDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toInvoiceDto(row));
}

export function toChargeTemplateDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CHARGE_TEMPLATE_KEYS]);
}

export function toChargeTemplateDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toChargeTemplateDto(row));
}

export function toInsuranceClaimDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INSURANCE_CLAIM_KEYS]);
}

export function toInsuranceClaimDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toInsuranceClaimDto(row));
}

export function toBillingNumberSequenceDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...BILLING_NUMBER_SEQUENCE_KEYS]);
}

export function toBillingNumberSequenceDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toBillingNumberSequenceDto(row));
}

export function toCashierReconciliationDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CASHIER_RECONCILIATION_KEYS]);
}

export function toCashierReconciliationDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toCashierReconciliationDto(row));
}

export function toDrugCatalogItemDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...DRUG_CATALOG_KEYS]);
}

export function toDrugCatalogItemDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toDrugCatalogItemDto(row));
}

export function toDrugInteractionRuleDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...DRUG_INTERACTION_RULE_KEYS]);
}

export function toDrugInteractionRuleDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toDrugInteractionRuleDto(row));
}

export function toInventoryItemDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INVENTORY_ITEM_KEYS]);
}

export function toInventoryItemDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toInventoryItemDto(row));
}

export function toInventoryLocationDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INVENTORY_LOCATION_KEYS]);
}

export function toInventoryLocationDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toInventoryLocationDto(row));
}

export function toInventoryLocationStockDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INVENTORY_LOCATION_STOCK_KEYS]);
}

export function toInventoryLocationStockDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toInventoryLocationStockDto(row));
}

export function toInventoryTransferDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INVENTORY_TRANSFER_KEYS]);
}

export function toInventoryTransferDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toInventoryTransferDto(row));
}

export function toInventoryLotDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INVENTORY_LOT_KEYS]);
}

export function toInventoryLotDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toInventoryLotDto(row));
}

export function toInventoryBarcodeScanDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INVENTORY_BARCODE_SCAN_KEYS]);
}

export function toInventoryBarcodePrintJobDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INVENTORY_BARCODE_PRINT_JOB_KEYS]);
}

export function toInventoryPrinterProfileDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...INVENTORY_PRINTER_PROFILE_KEYS]);
}

export function toInventoryPrinterProfileDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toInventoryPrinterProfileDto(row));
}

export function toSupplierDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...SUPPLIER_KEYS]);
}

export function toSupplierDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toSupplierDto(row));
}

export function toPurchaseOrderDto(row: unknown): Record<string, unknown> {
  const order = pickKeys(row, [...PURCHASE_ORDER_KEYS]);
  if (row && typeof row === 'object') {
    const source = row as Row;
    if (Array.isArray(source.lines)) {
      order.lines = source.lines.map((line) => pickKeys(line, [...PURCHASE_ORDER_LINE_KEYS]));
    }
    if (Array.isArray(source.approval_steps)) {
      order.approval_steps = source.approval_steps.map((step) =>
        pickKeys(step, [...PURCHASE_ORDER_APPROVAL_STEP_KEYS])
      );
    }
  }
  return order;
}

export function toPurchaseOrderDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPurchaseOrderDto(row));
}

export function toPurchaseOrderApprovalPolicyDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PURCHASE_ORDER_APPROVAL_POLICY_KEYS]);
}

export function toPurchaseOrderApprovalPolicyDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPurchaseOrderApprovalPolicyDto(row));
}

export function toStockMovementDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...STOCK_MOVEMENT_KEYS]);
}

export function toStockMovementDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toStockMovementDto(row));
}

export function toMedicationDispenseDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...MEDICATION_DISPENSE_KEYS]);
}

export function toMedicationDispenseDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toMedicationDispenseDto(row));
}

export function toUserDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...USER_KEYS]);
}

export function toUserDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toUserDto(row));
}

export function toPractitionerDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PRACTITIONER_KEYS]);
}

export function toPractitionerDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPractitionerDto(row));
}

export function toAppointmentDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...APPOINTMENT_KEYS]);
}

export function toAppointmentDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toAppointmentDto(row));
}

export function toClinicVisitDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CLINIC_VISIT_KEYS]);
}

export function toClinicVisitDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toClinicVisitDto(row));
}

export function toClinicalNoteTemplateDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CLINICAL_NOTE_TEMPLATE_KEYS]);
}

export function toClinicalNoteTemplateDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toClinicalNoteTemplateDto(row));
}

export function toClinicSettingsDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CLINIC_SETTINGS_KEYS]);
}

export function toEncounterDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...ENCOUNTER_KEYS]);
}

export function toConsentRecordDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CONSENT_RECORD_KEYS]);
}

export function toConsentRecordDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toConsentRecordDto(row));
}

export function toFileAssetDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...FILE_ASSET_KEYS]);
}

export function toFileAssetDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toFileAssetDto(row));
}

export function toAttachmentLinkDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...ATTACHMENT_LINK_KEYS]);
}

export function toAttachmentLinkDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toAttachmentLinkDto(row));
}

export function toPatientAllergyDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_ALLERGY_KEYS]);
}

export function toPatientAllergyDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPatientAllergyDto(row));
}

export function toPatientConditionDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_CONDITION_KEYS]);
}

export function toPatientConditionDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPatientConditionDto(row));
}

export function toPatientMedicationDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_MEDICATION_KEYS]);
}

export function toPatientMedicationDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPatientMedicationDto(row));
}

export function toPatientFlagDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_FLAG_KEYS]);
}

export function toPatientFlagDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPatientFlagDto(row));
}

export function toSoapNoteDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...SOAP_NOTE_KEYS]);
}
