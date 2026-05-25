# API Grouping v1

## Scope

This document groups the current Phase 1 API surface by domain boundary. The
routes are implemented in `backend/api/emrApi.ts` and delegate to controller and
service modules under `backend/api` and `backend/services`.

All routes except `GET /health` can be protected by bearer token when
`apiToken` is configured, and all business routes require role authorization.

## System

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Read service health. |

## Auth

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/sessions` | Exchange clinic id, username, and pilot login code for a signed bearer session token. |

## Patient and Clinical Profile

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/patients` | Register a new patient profile. |
| `GET` | `/api/patients/detail` | Read patient detail with active flags, encounters, and clinical children. |
| `GET` | `/api/patients/:patientId/allergies` | List patient allergies. |
| `GET` | `/api/patient-allergies/:allergyId` | Read one patient allergy. |
| `POST` | `/api/patient-allergies` | Create patient allergy. |
| `PATCH` | `/api/patient-allergies/:allergyId` | Update patient allergy. |
| `DELETE` | `/api/patient-allergies/:allergyId` | Soft delete patient allergy. |
| `GET` | `/api/patients/:patientId/conditions` | List patient conditions. |
| `GET` | `/api/patient-conditions/:conditionId` | Read one patient condition. |
| `POST` | `/api/patient-conditions` | Create patient condition. |
| `PATCH` | `/api/patient-conditions/:conditionId` | Update patient condition. |
| `DELETE` | `/api/patient-conditions/:conditionId` | Soft delete patient condition. |
| `GET` | `/api/patients/:patientId/medications` | List patient medications. |
| `GET` | `/api/patient-medications/:medicationId` | Read one patient medication. |
| `POST` | `/api/patient-medications` | Create patient medication. |
| `PATCH` | `/api/patient-medications/:medicationId` | Update patient medication. |
| `DELETE` | `/api/patient-medications/:medicationId` | Soft delete patient medication. |
| `GET` | `/api/patients/:patientId/flags` | List patient flags. |
| `GET` | `/api/patient-flags/:flagId` | Read one patient flag. |
| `POST` | `/api/patient-flags` | Create patient flag. |
| `PATCH` | `/api/patient-flags/:flagId` | Update patient flag. |
| `DELETE` | `/api/patient-flags/:flagId` | Soft delete patient flag. |

## Scheduling and Encounter

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/appointments` | List appointments. |
| `GET` | `/api/appointments/:appointmentId` | Read one appointment. |
| `POST` | `/api/appointments` | Create appointment. |
| `PATCH` | `/api/appointments/:appointmentId` | Update appointment. |
| `GET` | `/api/queue` | Read clinic queue / visit board with status, practitioner, room, and limit filters. |
| `POST` | `/api/visits` | Create dedicated check-in visit record. |
| `PATCH` | `/api/visits/:visitId` | Update visit lifecycle status, linked encounter, room, practitioner, or notes. |
| `POST` | `/api/encounters` | Create encounter with SOAP note and optional clinical children. |
| `GET` | `/api/encounters/:encounterId` | Read one encounter. |
| `PATCH` | `/api/encounters/:encounterId` | Update encounter metadata and status. |

## Clinical Documentation

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/clinical-notes/:clinicalNoteId/soap` | Read SOAP note by clinical note id. |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/soap` | Update SOAP note. |
| `DELETE` | `/api/clinical-notes/:clinicalNoteId/soap` | Soft delete SOAP note. |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/finalize` | Finalize clinical note. |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/sign` | Sign clinical note. |
| `GET` | `/api/clinical-note-templates` | List clinic-managed SOAP templates. |
| `POST` | `/api/clinical-note-templates` | Create clinic-managed SOAP template. |
| `PATCH` | `/api/clinical-note-templates/:templateId` | Update or deactivate clinic-managed SOAP template. |
| `GET` | `/api/clinics/:clinicId/settings` | Read clinic branding, logo asset, and prescription print settings. |
| `PATCH` | `/api/clinics/:clinicId/settings` | Create or update clinic branding, logo asset, and prescription print settings. |
| `GET` | `/api/encounters/:encounterId/diagnoses` | List diagnoses for an encounter. |
| `GET` | `/api/diagnoses/:diagnosisId` | Read one diagnosis. |
| `POST` | `/api/diagnoses` | Create diagnosis. |
| `PATCH` | `/api/diagnoses/:diagnosisId` | Update diagnosis. |
| `DELETE` | `/api/diagnoses/:diagnosisId` | Soft delete diagnosis. |
| `GET` | `/api/encounters/:encounterId/vital-signs` | List vital signs for an encounter. |
| `GET` | `/api/vital-signs/:vitalSignId` | Read one vital sign. |
| `POST` | `/api/vital-signs` | Create vital sign. |
| `PATCH` | `/api/vital-signs/:vitalSignId` | Update vital sign. |
| `DELETE` | `/api/vital-signs/:vitalSignId` | Soft delete vital sign. |
| `GET` | `/api/encounters/:encounterId/prescriptions` | List prescriptions for an encounter. |
| `GET` | `/api/prescriptions/:prescriptionId` | Read one prescription. |
| `GET` | `/api/prescriptions/:prescriptionId/dispenses` | List dispense records for one prescription. |
| `POST` | `/api/prescriptions` | Create prescription. |
| `POST` | `/api/prescriptions/:prescriptionId/dispenses` | Dispense medication from inventory for one prescription. |
| `PATCH` | `/api/prescriptions/:prescriptionId` | Update prescription. |
| `DELETE` | `/api/prescriptions/:prescriptionId` | Soft delete prescription. |
| `GET` | `/api/drug-catalog` | List clinic drug catalog items with search, active status, and pagination filters. |
| `POST` | `/api/drug-catalog` | Create clinic drug catalog item. |
| `PATCH` | `/api/drug-catalog/:drugCatalogId` | Update or deactivate clinic drug catalog item. |
| `GET` | `/api/inventory-items` | List inventory items with active, low-stock, search, and pagination filters. |
| `POST` | `/api/inventory-items` | Create inventory item linked optionally to drug catalog. |
| `PATCH` | `/api/inventory-items/:inventoryItemId` | Update inventory metadata and reorder level. |
| `PATCH` | `/api/inventory-items/:inventoryItemId/stock` | Record manual stock adjustment and update quantity on hand. |
| `GET` | `/api/stock-movements` | List stock movement audit rows by clinic and optional inventory item. |
| `GET` | `/api/medication-dispenses` | List medication dispense rows by clinic. |
| `GET` | `/api/drug-interaction-rules` | List clinic-managed interaction rules. |
| `POST` | `/api/drug-interaction-rules` | Create clinic-managed interaction rule. |
| `PATCH` | `/api/drug-interaction-rules/:interactionRuleId` | Update or deactivate clinic-managed interaction rule. |
| `POST` | `/api/prescription-safety-checks` | Check a medication against active patient allergies and catalog allergen tags. |

## Files, Consent, and Audit

## Billing and Payment

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/invoices` | List invoices by clinic with optional patient, status, limit, and offset filters. |
| `GET` | `/api/invoices/:invoiceId` | Read one invoice with line items and payments. |
| `POST` | `/api/invoices` | Create an invoice with line items and calculated totals. |
| `POST` | `/api/invoices/from-encounter` | Create a draft invoice by capturing visit and prescription charges from an encounter. |
| `PATCH` | `/api/invoices/:invoiceId` | Update editable invoice metadata and replace line items before payment/refund activity. |
| `POST` | `/api/invoices/:invoiceId/payments` | Record an invoice payment and recalculate paid, balance, and status. |
| `POST` | `/api/invoices/:invoiceId/refunds` | Record an invoice refund and recalculate paid, refunded, balance, and status. |
| `PATCH` | `/api/invoices/:invoiceId/void` | Void an invoice with a required reason. |
| `GET` | `/api/charge-templates` | List common charge templates by clinic and active status. |
| `POST` | `/api/charge-templates` | Create a clinic charge template. |
| `PATCH` | `/api/charge-templates/:chargeTemplateId` | Update or deactivate a clinic charge template. |
| `GET` | `/api/insurance-claims` | List insurance claims by clinic, invoice, status, limit, and offset. |
| `POST` | `/api/insurance-claims` | Create an insurance claim linked to an invoice. |
| `PATCH` | `/api/insurance-claims/:insuranceClaimId` | Update insurance claim status and adjudication fields. |
| `GET` | `/api/billing-number-sequences` | List active and historical document number sequences for a clinic. |
| `POST` | `/api/billing-number-sequences` | Create a document number sequence for invoice, receipt, tax invoice, or claim numbers. |
| `POST` | `/api/billing-number-sequences/issue` | Issue the next document number from an active sequence. |
| `GET` | `/api/cashier-reconciliations` | List cashier reconciliation sessions by clinic and status. |
| `POST` | `/api/cashier-reconciliations` | Open a cashier reconciliation session with opening cash. |
| `PATCH` | `/api/cashier-reconciliations/:reconciliationId/close` | Close a cashier reconciliation session and calculate expected cash and variance. |

## Reporting

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/reports/daily-operations` | Date-range visits, queue status, diagnosis, prescription, provider, room, and prescriber aggregates. |
| `GET` | `/api/reports/daily-operations.csv` | CSV export for the same operations report metrics. |
| `GET` | `/api/reports/billing-summary` | Date-range invoice, payment, refund, outstanding, and claim aggregates. |
| `GET` | `/api/reports/billing-summary.csv` | CSV export for billing summary metrics. |

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/patients/:patientId/consents` | List consent records for a patient. |
| `GET` | `/api/consents/:consentId` | Read one consent record. |
| `POST` | `/api/consents` | Create consent record. |
| `PATCH` | `/api/consents/:consentId` | Update consent record. |
| `GET` | `/api/file-assets` | List active clinic file assets for attachment and branding pickers. |
| `GET` | `/api/file-assets/storage-policy` | Read configured upload size and MIME policy. |
| `GET` | `/api/file-assets/:fileAssetId` | Read one file asset. |
| `GET` | `/api/file-assets/:fileAssetId/download` | Download stored file asset bytes. |
| `POST` | `/api/file-assets` | Create file asset metadata. |
| `POST` | `/api/file-assets/upload` | Upload base64 file content and create file asset metadata. |
| `GET` | `/api/attachments` | List attachment links by target. |
| `POST` | `/api/attachments` | Create attachment link. |
| `GET` | `/api/audit-logs` | Read audit logs by entity with optional limit. |
| `GET` | `/api/patients/:patientId/timeline` | Read patient timeline. |

## Organization and Access

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/users` | List users with search, active status, and pagination filters. |
| `POST` | `/api/users` | Create user. |
| `PATCH` | `/api/users/:userId` | Update user. |
| `GET` | `/api/practitioners` | List practitioners with search, active status, and pagination filters. |
| `POST` | `/api/practitioners` | Create practitioner. |
| `PATCH` | `/api/practitioners/:practitionerId` | Update practitioner. |

## Phase 2A Additions

- Dedicated `clinic_visits` records now represent check-in and queue lifecycle.
- The frontend includes a Queue Board tab for waiting, in-room, with-doctor,
  completed, discharged, and cancelled visits.
- SOAP entry uses clinic-managed templates with starter fallbacks.
- Prescription cards include a clinic-branded print/export view.
- Queue board includes operations summary metrics.
- Patient detail includes a compact timeline panel.

## Phase 2B Additions

- Drug catalog items can carry RxNorm/generic fields and allergen tags.
- Prescription safety checks return allergy and medication interaction warnings
  before prescribing.
- Prescriptions can store warning snapshots in `safety_warnings`.

## Phase 3A Additions

- Billing foundation tables now store invoices, invoice line items, invoice
  payments, invoice refunds, charge templates, receipt/tax invoice numbering,
  and insurance claims.
- Invoice creation calculates subtotal, discount, tax, total, paid amount, and
  balance from structured line items and payments.
- Editable invoices can have line items replaced before payments/refunds.
- Encounter charge capture can create draft invoices from visit and prescription
  activity using clinic charge templates.
- Payment and refund recording update invoice paid/refunded/balance values and
  status based on the remaining balance.
- Invoice voiding stores a required reason and marks the invoice `voided`.
- Billing routes use dedicated read/write permissions and write audit logs when
  invoices are created/updated, charge capture runs, payments/refunds are
  recorded, invoices are voided, charge templates change, or insurance claims
  change.

## Phase 3B Additions

- Billing reports now include JSON and CSV accounting summaries by date range.
- Billing document number sequences support invoice, receipt, tax invoice, and
  claim numbering policies per clinic.
- Cashier reconciliation records capture opening cash, expected cash, counted
  cash, and variance for daily close.
- The Cashier tab exposes Phase 3B summary metrics, number sequence actions, and
  reconciliation open/close controls.

## Phase 3C Additions

- Pharmacy inventory tables now track inventory items, medication dispenses, and
  stock movements.
- Inventory items can be linked to drug catalog and carry quantity on hand,
  reorder level, unit, and low-stock state.
- Dispensing from a prescription reduces stock and writes dispense plus stock
  movement records.
- The Prescriptions tab exposes inventory setup, stock adjustment, and dispense
  controls for pilot workflows.

## Historical Phase 1 Mismatches and Follow-ups

- Permission and workflow definitions now exist as documentation, while
  permissions are still kept in code. Appointment and encounter status updates
  enforce the documented transition graphs; other workflow state machines are
  not yet centrally enforced.
