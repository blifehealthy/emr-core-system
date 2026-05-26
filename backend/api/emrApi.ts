import { authenticateBearerRequest, getActorContext, withResolvedActor } from './auth.ts';
import {
  handleCreateAttachmentLink,
  handleCreateAppointment,
  handleCreateAuthSession,
  handleCreateChargeTemplate,
  handleCreateClinicVisit,
  handleCreateClinicalNoteTemplate,
  handleCreateConsentRecord,
  handleCreateFileAsset,
  handleCreateInvoice,
  handleCreateInvoiceFromEncounter,
  handleCreateInsuranceClaim,
  handleCreateBillingNumberSequence,
  handleCreateCashierReconciliation,
  handleCreateDiagnosis,
  handleCreateDrugCatalogItem,
  handleCreateDrugInteractionRule,
  handleCreateInventoryItem,
  handleCreateInventoryBarcodePrintJob,
  handleCreateInventoryLocation,
  handleCreateInventoryTransfer,
  handleCreateInventoryPrinterProfile,
  handleCreatePurchaseOrder,
  handleCreatePurchaseOrderApprovalPolicy,
  handleCreateSupplier,
  handleCreatePatientAllergy,
  handleCreatePatientCondition,
  handleCreatePatientFlag,
  handleCreatePatientMedication,
  handleCreatePatient,
  handleCreatePractitioner,
  handleCreatePrescription,
  handleCreateEncounter,
  handleCreateUser,
  handleCreateVitalSign,
  handleDeleteDiagnosis,
  handleDownloadFileAsset,
  handleDeletePatientAllergy,
  handleDeletePatientCondition,
  handleDeletePatientFlag,
  handleDeletePatientMedication,
  handleDeletePrescription,
  handleDeleteSoapNote,
  handleDeleteVitalSign,
  handleFinalizeClinicalNote,
  handleGetAuditLogsByEntity,
  handleGetAppointment,
  handleGetClinicSettings,
  handleGetConsentRecord,
  handleGetDailyOperationsReport,
  handleGetDailyOperationsReportCsv,
  handleGetBillingSummaryReport,
  handleGetBillingSummaryReportCsv,
  handleGetDiagnosis,
  handleAssessPrescriptionSafety,
  handleGetEncounter,
  handleGetFileAsset,
  handleGetFileAssetStoragePolicy,
  handleGetInvoice,
  handleGetPatientDetail,
  handleGetPatientAllergy,
  handleGetPatientCondition,
  handleGetPatientFlag,
  handleGetPatientMedication,
  handleGetPatientTimeline,
  handleGetPrescription,
  handleGetSoapNote,
  handleGetVitalSign,
  handleHealthCheck,
  handleListAttachments,
  handleListAppointments,
  handleListChargeTemplates,
  handleListClinicQueue,
  handleListClinicalNoteTemplates,
  handleListConsentRecordsByPatient,
  handleListDiagnosesByEncounter,
  handleListDrugCatalog,
  handleListDrugInteractionRules,
  handleListInventoryItems,
  handleListInventoryLocationStocks,
  handleListInventoryLocations,
  handleListInventoryLots,
  handleListInventoryTransfers,
  handleListInventoryPrinterProfiles,
  handleListPurchaseOrders,
  handleListPurchaseOrderApprovalPolicies,
  handleListSuppliers,
  handleListMedicationDispenses,
  handleListStockMovements,
  handleListFileAssets,
  handleListInvoices,
  handleListInsuranceClaims,
  handleListBillingNumberSequences,
  handleListCashierReconciliations,
  handleListPatientAllergies,
  handleListPatientConditions,
  handleListPatientFlags,
  handleListPatientMedications,
  handleListPractitioners,
  handleListPrescriptionsByEncounter,
  handleListUsers,
  handleListVitalSignsByEncounter,
  handleSignClinicalNote,
  handleUpdateAppointment,
  handleUpdateClinicVisit,
  handleUpdateClinicalNoteTemplate,
  handleUpdateConsentRecord,
  handleUpdateDrugCatalogItem,
  handleUpdateDrugInteractionRule,
  handleUpdateInventoryItem,
  handleUpdateInventoryLocation,
  handleUpdateInventoryPrinterProfile,
  handleUpdatePurchaseOrder,
  handleUpdatePurchaseOrderApprovalPolicy,
  handleUpdateSupplier,
  handleUpsertClinicSettings,
  handleUpdatePatientAllergy,
  handleUpdatePatientCondition,
  handleUpdatePatientFlag,
  handleUpdatePatientMedication,
  handleUpdatePractitioner,
  handleUpdatePrescription,
  handleUpdateDiagnosis,
  handleUpdateEncounter,
  handleUpdateSoapNote,
  handleUpdateUser,
  handleUpdateVitalSign,
  handleUploadFileAsset,
  handleRecordInvoicePayment,
  handleRecordInvoiceRefund,
  handleAdjustInventoryStock,
  handleReceiveInventoryLot,
  handleScanInventoryBarcode,
  handleReceivePurchaseOrder,
  handleSubmitPurchaseOrder,
  handleApprovePurchaseOrder,
  handleRejectPurchaseOrder,
  handleDispensePrescription,
  handleIssueBillingNumber,
  handleCloseCashierReconciliation,
  handleUpdateChargeTemplate,
  handleUpdateInsuranceClaim,
  handleUpdateInvoice,
  handleVoidInvoice,
  notFound,
} from './controllers.ts';
import { requireRole } from './auth.ts';
import type { Dependencies, HttpRequest, HttpResponse } from './types.ts';

export type { Dependencies, HttpRequest, HttpResponse } from './types.ts';

export function createEmrApi(dependencies: Dependencies) {
  return async function handleRequest(request: HttpRequest): Promise<HttpResponse> {
    const response = await handleEmrRequest(request, dependencies);
    await auditSecurityResponse(request, response, dependencies);
    return response;
  };
}

async function handleEmrRequest(request: HttpRequest, dependencies: Dependencies): Promise<HttpResponse> {
    if (request.method === 'GET' && request.path === '/health') {
      return handleHealthCheck(dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/auth/sessions') {
      return handleCreateAuthSession(request, dependencies);
    }

    const auth = authenticateBearerRequest(request, {
      apiToken: dependencies.apiToken,
      sessionSecret: dependencies.sessionAuthSecret,
      oidc: dependencies.oidcAuth,
    });

    if (!auth.ok) {
      return auth.response;
    }

    let actorAwareRequest = auth.request;
    const actor = getActorContext(actorAwareRequest);

    if (dependencies.resolveOidcActor && actor.oidcSubject) {
      const resolvedActor = await dependencies.resolveOidcActor({
        oidcSubject: actor.oidcSubject,
      });

      if (!resolvedActor) {
        return {
          status: 403,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          body: { error: 'OIDC actor could not be resolved' },
        };
      }

      actorAwareRequest = withResolvedActor(actorAwareRequest, {
        userId: resolvedActor.user_id,
        practitionerId: resolvedActor.practitioner_id,
        role: resolvedActor.role,
      });
    } else if (dependencies.resolveActor) {
      if (!actor.userId) {
        return {
          status: 403,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          body: { error: 'x-user-id header is required' },
        };
      }

      const resolvedActor = await dependencies.resolveActor({ userId: actor.userId });

      if (!resolvedActor) {
        return {
          status: 403,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          body: { error: 'Actor could not be resolved' },
        };
      }

      actorAwareRequest = withResolvedActor(request, {
        userId: resolvedActor.user_id,
        practitionerId: resolvedActor.practitioner_id,
        role: resolvedActor.role,
      });
    }

    if (request.method === 'GET' && request.path === '/api/patients/detail') {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleGetPatientDetail(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/patients') {
      const roleError = requireRole(actorAwareRequest, 'patient_write');
      if (roleError) return roleError;
      return handleCreatePatient(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/appointments') {
      const roleError = requireRole(actorAwareRequest, 'appointment_read');
      if (roleError) return roleError;
      return handleListAppointments(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/queue') {
      const roleError = requireRole(actorAwareRequest, 'appointment_read');
      if (roleError) return roleError;
      return handleListClinicQueue(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/attachments') {
      const roleError = requireRole(actorAwareRequest, 'attachment_read');
      if (roleError) return roleError;
      return handleListAttachments(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/file-assets') {
      const roleError = requireRole(actorAwareRequest, 'attachment_read');
      if (roleError) return roleError;
      return handleListFileAssets(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/file-assets/storage-policy') {
      const roleError = requireRole(actorAwareRequest, 'attachment_read');
      if (roleError) return roleError;
      return handleGetFileAssetStoragePolicy(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/invoices') {
      const roleError = requireRole(actorAwareRequest, 'billing_read');
      if (roleError) return roleError;
      return handleListInvoices(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/charge-templates') {
      const roleError = requireRole(actorAwareRequest, 'billing_read');
      if (roleError) return roleError;
      return handleListChargeTemplates(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/insurance-claims') {
      const roleError = requireRole(actorAwareRequest, 'billing_read');
      if (roleError) return roleError;
      return handleListInsuranceClaims(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/billing-number-sequences') {
      const roleError = requireRole(actorAwareRequest, 'billing_read');
      if (roleError) return roleError;
      return handleListBillingNumberSequences(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/cashier-reconciliations') {
      const roleError = requireRole(actorAwareRequest, 'billing_read');
      if (roleError) return roleError;
      return handleListCashierReconciliations(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/inventory-items') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListInventoryItems(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/inventory-lots') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListInventoryLots(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/inventory-locations') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListInventoryLocations(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/inventory-location-stocks') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListInventoryLocationStocks(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/inventory-transfers') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListInventoryTransfers(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/inventory-printer-profiles') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListInventoryPrinterProfiles(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/suppliers') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListSuppliers(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/purchase-orders') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListPurchaseOrders(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/purchase-order-approval-policies') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListPurchaseOrderApprovalPolicies(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/stock-movements') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListStockMovements(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/medication-dispenses') {
      const roleError = requireRole(actorAwareRequest, 'prescription_read');
      if (roleError) return roleError;
      return handleListMedicationDispenses(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/users') {
      const roleError = requireRole(actorAwareRequest, 'user_read');
      if (roleError) return roleError;
      return handleListUsers(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/practitioners') {
      const roleError = requireRole(actorAwareRequest, 'practitioner_read');
      if (roleError) return roleError;
      return handleListPractitioners(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/drug-catalog') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_read');
      if (roleError) return roleError;
      return handleListDrugCatalog(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/drug-interaction-rules') {
      const roleError = requireRole(actorAwareRequest, 'drug_interaction_rule_read');
      if (roleError) return roleError;
      return handleListDrugInteractionRules(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/clinical-note-templates') {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleListClinicalNoteTemplates(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/reports/daily-operations') {
      const roleError = requireRole(actorAwareRequest, 'audit_read');
      if (roleError) return roleError;
      return handleGetDailyOperationsReport(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/reports/daily-operations.csv') {
      const roleError = requireRole(actorAwareRequest, 'audit_read');
      if (roleError) return roleError;
      return handleGetDailyOperationsReportCsv(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/reports/billing-summary') {
      const roleError = requireRole(actorAwareRequest, 'billing_read');
      if (roleError) return roleError;
      return handleGetBillingSummaryReport(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/reports/billing-summary.csv') {
      const roleError = requireRole(actorAwareRequest, 'billing_read');
      if (roleError) return roleError;
      return handleGetBillingSummaryReportCsv(actorAwareRequest, dependencies);
    }

    if (request.method === 'GET' && request.path === '/api/audit-logs') {
      const roleError = requireRole(actorAwareRequest, 'audit_read');
      if (roleError) return roleError;
      return handleGetAuditLogsByEntity(actorAwareRequest, dependencies);
    }

    const soapReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/clinical-notes\/([^/]+)\/soap$/) : null;
    if (soapReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleGetSoapNote(actorAwareRequest, dependencies, soapReadMatch[1]);
    }

    const diagnosisReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/diagnoses\/([^/]+)$/) : null;
    if (diagnosisReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleGetDiagnosis(actorAwareRequest, dependencies, diagnosisReadMatch[1]);
    }

    const appointmentReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/appointments\/([^/]+)$/) : null;
    if (appointmentReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'appointment_read');
      if (roleError) return roleError;
      return handleGetAppointment(actorAwareRequest, dependencies, appointmentReadMatch[1]);
    }

    const clinicSettingsReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/clinics\/([^/]+)\/settings$/) : null;
    if (clinicSettingsReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleGetClinicSettings(actorAwareRequest, dependencies, clinicSettingsReadMatch[1]);
    }

    const encounterReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/encounters\/([^/]+)$/) : null;
    if (encounterReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleGetEncounter(actorAwareRequest, dependencies, encounterReadMatch[1]);
    }

    const vitalSignReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/vital-signs\/([^/]+)$/) : null;
    if (vitalSignReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleGetVitalSign(actorAwareRequest, dependencies, vitalSignReadMatch[1]);
    }

    const timelineMatch =
      request.method === 'GET'
        ? request.path.match(/^\/api\/patients\/([^/]+)\/timeline$/)
        : null;
    if (timelineMatch) {
      const roleError = requireRole(actorAwareRequest, 'audit_read');
      if (roleError) return roleError;
      return handleGetPatientTimeline(actorAwareRequest, dependencies, timelineMatch[1]);
    }

    const consentListMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/patients\/([^/]+)\/consents$/) : null;
    if (consentListMatch) {
      const roleError = requireRole(actorAwareRequest, 'consent_read');
      if (roleError) return roleError;
      return handleListConsentRecordsByPatient(
        actorAwareRequest,
        dependencies,
        consentListMatch[1]
      );
    }

    const allergyListMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/patients\/([^/]+)\/allergies$/) : null;
    if (allergyListMatch) {
      const roleError = requireRole(actorAwareRequest, 'allergy_read');
      if (roleError) return roleError;
      return handleListPatientAllergies(actorAwareRequest, dependencies, allergyListMatch[1]);
    }

    const conditionListMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/patients\/([^/]+)\/conditions$/) : null;
    if (conditionListMatch) {
      const roleError = requireRole(actorAwareRequest, 'condition_read');
      if (roleError) return roleError;
      return handleListPatientConditions(actorAwareRequest, dependencies, conditionListMatch[1]);
    }

    const medicationListMatch =
      request.method === 'GET'
        ? request.path.match(/^\/api\/patients\/([^/]+)\/medications$/)
        : null;
    if (medicationListMatch) {
      const roleError = requireRole(actorAwareRequest, 'medication_read');
      if (roleError) return roleError;
      return handleListPatientMedications(actorAwareRequest, dependencies, medicationListMatch[1]);
    }

    const flagListMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/patients\/([^/]+)\/flags$/) : null;
    if (flagListMatch) {
      const roleError = requireRole(actorAwareRequest, 'flag_read');
      if (roleError) return roleError;
      return handleListPatientFlags(actorAwareRequest, dependencies, flagListMatch[1]);
    }

    const prescriptionListMatch =
      request.method === 'GET'
        ? request.path.match(/^\/api\/encounters\/([^/]+)\/prescriptions$/)
        : null;
    if (prescriptionListMatch) {
      const roleError = requireRole(actorAwareRequest, 'prescription_read');
      if (roleError) return roleError;
      return handleListPrescriptionsByEncounter(
        actorAwareRequest,
        dependencies,
        prescriptionListMatch[1]
      );
    }

    const diagnosisListMatch =
      request.method === 'GET'
        ? request.path.match(/^\/api\/encounters\/([^/]+)\/diagnoses$/)
        : null;
    if (diagnosisListMatch) {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleListDiagnosesByEncounter(actorAwareRequest, dependencies, diagnosisListMatch[1]);
    }

    const vitalSignListMatch =
      request.method === 'GET'
        ? request.path.match(/^\/api\/encounters\/([^/]+)\/vital-signs$/)
        : null;
    if (vitalSignListMatch) {
      const roleError = requireRole(actorAwareRequest, 'patient_read');
      if (roleError) return roleError;
      return handleListVitalSignsByEncounter(
        actorAwareRequest,
        dependencies,
        vitalSignListMatch[1]
      );
    }

    const prescriptionReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/prescriptions\/([^/]+)$/) : null;
    if (prescriptionReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'prescription_read');
      if (roleError) return roleError;
      return handleGetPrescription(actorAwareRequest, dependencies, prescriptionReadMatch[1]);
    }

    const prescriptionDispenseListMatch =
      request.method === 'GET'
        ? request.path.match(/^\/api\/prescriptions\/([^/]+)\/dispenses$/)
        : null;
    if (prescriptionDispenseListMatch) {
      const roleError = requireRole(actorAwareRequest, 'prescription_read');
      if (roleError) return roleError;
      return handleListMedicationDispenses(
        actorAwareRequest,
        dependencies,
        prescriptionDispenseListMatch[1]
      );
    }

    const invoiceReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/invoices\/([^/]+)$/) : null;
    if (invoiceReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'billing_read');
      if (roleError) return roleError;
      return handleGetInvoice(dependencies, invoiceReadMatch[1]);
    }

    const consentReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/consents\/([^/]+)$/) : null;
    if (consentReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'consent_read');
      if (roleError) return roleError;
      return handleGetConsentRecord(actorAwareRequest, dependencies, consentReadMatch[1]);
    }

    const fileAssetDownloadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/file-assets\/([^/]+)\/download$/) : null;
    if (fileAssetDownloadMatch) {
      const roleError = requireRole(actorAwareRequest, 'attachment_read');
      if (roleError) return roleError;
      return handleDownloadFileAsset(actorAwareRequest, dependencies, fileAssetDownloadMatch[1]);
    }

    const fileAssetReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/file-assets\/([^/]+)$/) : null;
    if (fileAssetReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'attachment_read');
      if (roleError) return roleError;
      return handleGetFileAsset(actorAwareRequest, dependencies, fileAssetReadMatch[1]);
    }

    const allergyReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/patient-allergies\/([^/]+)$/) : null;
    if (allergyReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'allergy_read');
      if (roleError) return roleError;
      return handleGetPatientAllergy(actorAwareRequest, dependencies, allergyReadMatch[1]);
    }

    const conditionReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/patient-conditions\/([^/]+)$/) : null;
    if (conditionReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'condition_read');
      if (roleError) return roleError;
      return handleGetPatientCondition(actorAwareRequest, dependencies, conditionReadMatch[1]);
    }

    const medicationReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/patient-medications\/([^/]+)$/) : null;
    if (medicationReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'medication_read');
      if (roleError) return roleError;
      return handleGetPatientMedication(actorAwareRequest, dependencies, medicationReadMatch[1]);
    }

    const flagReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/patient-flags\/([^/]+)$/) : null;
    if (flagReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'flag_read');
      if (roleError) return roleError;
      return handleGetPatientFlag(actorAwareRequest, dependencies, flagReadMatch[1]);
    }

    if (request.method === 'POST' && request.path === '/api/encounters') {
      const roleError = requireRole(actorAwareRequest, 'encounter_create');
      if (roleError) return roleError;
      return handleCreateEncounter(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/appointments') {
      const roleError = requireRole(actorAwareRequest, 'appointment_write');
      if (roleError) return roleError;
      return handleCreateAppointment(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/visits') {
      const roleError = requireRole(actorAwareRequest, 'appointment_write');
      if (roleError) return roleError;
      return handleCreateClinicVisit(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/clinical-note-templates') {
      const roleError = requireRole(actorAwareRequest, 'soap_update');
      if (roleError) return roleError;
      return handleCreateClinicalNoteTemplate(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/users') {
      const roleError = requireRole(actorAwareRequest, 'user_write');
      if (roleError) return roleError;
      return handleCreateUser(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/practitioners') {
      const roleError = requireRole(actorAwareRequest, 'practitioner_write');
      if (roleError) return roleError;
      return handleCreatePractitioner(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/drug-catalog') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreateDrugCatalogItem(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/drug-interaction-rules') {
      const roleError = requireRole(actorAwareRequest, 'drug_interaction_rule_write');
      if (roleError) return roleError;
      return handleCreateDrugInteractionRule(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/inventory-items') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreateInventoryItem(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/inventory-lots/receive') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleReceiveInventoryLot(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/inventory-locations') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreateInventoryLocation(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/inventory-transfers') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreateInventoryTransfer(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/inventory-barcode-scans') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleScanInventoryBarcode(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/inventory-barcode-print-jobs') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreateInventoryBarcodePrintJob(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/inventory-printer-profiles') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreateInventoryPrinterProfile(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/suppliers') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreateSupplier(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/purchase-orders') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreatePurchaseOrder(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/purchase-order-approval-policies') {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleCreatePurchaseOrderApprovalPolicy(actorAwareRequest, dependencies);
    }

    const purchaseOrderReceivePostMatch =
      request.method === 'POST'
        ? request.path.match(/^\/api\/purchase-orders\/([^/]+)\/receive$/)
        : null;
    if (purchaseOrderReceivePostMatch) {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleReceivePurchaseOrder(
        actorAwareRequest,
        dependencies,
        purchaseOrderReceivePostMatch[1]
      );
    }

    const purchaseOrderSubmitPostMatch =
      request.method === 'POST'
        ? request.path.match(/^\/api\/purchase-orders\/([^/]+)\/submit$/)
        : null;
    if (purchaseOrderSubmitPostMatch) {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleSubmitPurchaseOrder(
        actorAwareRequest,
        dependencies,
        purchaseOrderSubmitPostMatch[1]
      );
    }

    const purchaseOrderApprovePostMatch =
      request.method === 'POST'
        ? request.path.match(/^\/api\/purchase-orders\/([^/]+)\/approve$/)
        : null;
    if (purchaseOrderApprovePostMatch) {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleApprovePurchaseOrder(
        actorAwareRequest,
        dependencies,
        purchaseOrderApprovePostMatch[1]
      );
    }

    const purchaseOrderRejectPostMatch =
      request.method === 'POST'
        ? request.path.match(/^\/api\/purchase-orders\/([^/]+)\/reject$/)
        : null;
    if (purchaseOrderRejectPostMatch) {
      const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
      if (roleError) return roleError;
      return handleRejectPurchaseOrder(
        actorAwareRequest,
        dependencies,
        purchaseOrderRejectPostMatch[1]
      );
    }

    if (request.method === 'POST' && request.path === '/api/prescription-safety-checks') {
      const roleError = requireRole(actorAwareRequest, 'prescription_write');
      if (roleError) return roleError;
      return handleAssessPrescriptionSafety(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/prescriptions') {
      const roleError = requireRole(actorAwareRequest, 'prescription_write');
      if (roleError) return roleError;
      return handleCreatePrescription(actorAwareRequest, dependencies);
    }

    const prescriptionDispenseMatch =
      request.method === 'POST'
        ? request.path.match(/^\/api\/prescriptions\/([^/]+)\/dispenses$/)
        : null;
    if (prescriptionDispenseMatch) {
      const roleError = requireRole(actorAwareRequest, 'prescription_write');
      if (roleError) return roleError;
      return handleDispensePrescription(actorAwareRequest, dependencies, prescriptionDispenseMatch[1]);
    }

    if (request.method === 'POST' && request.path === '/api/invoices') {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleCreateInvoice(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/invoices/from-encounter') {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleCreateInvoiceFromEncounter(actorAwareRequest, dependencies);
    }

    const invoiceUpdateMatch =
      request.method === 'PATCH'
        ? request.path.match(/^\/api\/invoices\/([^/]+)$/)
        : null;
    if (invoiceUpdateMatch) {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleUpdateInvoice(actorAwareRequest, dependencies, invoiceUpdateMatch[1]);
    }

    if (request.method === 'POST' && request.path === '/api/charge-templates') {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleCreateChargeTemplate(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/insurance-claims') {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleCreateInsuranceClaim(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/billing-number-sequences') {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleCreateBillingNumberSequence(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/billing-number-sequences/issue') {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleIssueBillingNumber(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/cashier-reconciliations') {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleCreateCashierReconciliation(actorAwareRequest, dependencies);
    }

    const invoicePaymentMatch =
      request.method === 'POST'
        ? request.path.match(/^\/api\/invoices\/([^/]+)\/payments$/)
        : null;
    if (invoicePaymentMatch) {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleRecordInvoicePayment(actorAwareRequest, dependencies, invoicePaymentMatch[1]);
    }

    const invoiceRefundMatch =
      request.method === 'POST'
        ? request.path.match(/^\/api\/invoices\/([^/]+)\/refunds$/)
        : null;
    if (invoiceRefundMatch) {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleRecordInvoiceRefund(actorAwareRequest, dependencies, invoiceRefundMatch[1]);
    }

    const invoiceVoidMatch =
      request.method === 'PATCH'
        ? request.path.match(/^\/api\/invoices\/([^/]+)\/void$/)
        : null;
    if (invoiceVoidMatch) {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleVoidInvoice(actorAwareRequest, dependencies, invoiceVoidMatch[1]);
    }

    const chargeTemplateUpdateMatch =
      request.method === 'PATCH'
        ? request.path.match(/^\/api\/charge-templates\/([^/]+)$/)
        : null;
    if (chargeTemplateUpdateMatch) {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleUpdateChargeTemplate(actorAwareRequest, dependencies, chargeTemplateUpdateMatch[1]);
    }

    const insuranceClaimUpdateMatch =
      request.method === 'PATCH'
        ? request.path.match(/^\/api\/insurance-claims\/([^/]+)$/)
        : null;
    if (insuranceClaimUpdateMatch) {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleUpdateInsuranceClaim(actorAwareRequest, dependencies, insuranceClaimUpdateMatch[1]);
    }

    const cashierReconciliationCloseMatch =
      request.method === 'PATCH'
        ? request.path.match(/^\/api\/cashier-reconciliations\/([^/]+)\/close$/)
        : null;
    if (cashierReconciliationCloseMatch) {
      const roleError = requireRole(actorAwareRequest, 'billing_write');
      if (roleError) return roleError;
      return handleCloseCashierReconciliation(
        actorAwareRequest,
        dependencies,
        cashierReconciliationCloseMatch[1]
      );
    }

    if (request.method === 'POST' && request.path === '/api/consents') {
      const roleError = requireRole(actorAwareRequest, 'consent_write');
      if (roleError) return roleError;
      return handleCreateConsentRecord(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/file-assets') {
      const roleError = requireRole(actorAwareRequest, 'attachment_write');
      if (roleError) return roleError;
      return handleCreateFileAsset(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/file-assets/upload') {
      const roleError = requireRole(actorAwareRequest, 'attachment_write');
      if (roleError) return roleError;
      return handleUploadFileAsset(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/attachments') {
      const roleError = requireRole(actorAwareRequest, 'attachment_write');
      if (roleError) return roleError;
      return handleCreateAttachmentLink(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/diagnoses') {
      const roleError = requireRole(actorAwareRequest, 'diagnosis_update');
      if (roleError) return roleError;
      return handleCreateDiagnosis(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/patient-allergies') {
      const roleError = requireRole(actorAwareRequest, 'allergy_write');
      if (roleError) return roleError;
      return handleCreatePatientAllergy(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/patient-conditions') {
      const roleError = requireRole(actorAwareRequest, 'condition_write');
      if (roleError) return roleError;
      return handleCreatePatientCondition(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/patient-medications') {
      const roleError = requireRole(actorAwareRequest, 'medication_write');
      if (roleError) return roleError;
      return handleCreatePatientMedication(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/patient-flags') {
      const roleError = requireRole(actorAwareRequest, 'flag_write');
      if (roleError) return roleError;
      return handleCreatePatientFlag(actorAwareRequest, dependencies);
    }

    if (request.method === 'POST' && request.path === '/api/vital-signs') {
      const roleError = requireRole(actorAwareRequest, 'vital_sign_update');
      if (roleError) return roleError;
      return handleCreateVitalSign(actorAwareRequest, dependencies);
    }

    if (request.method === 'PATCH') {
      const userMatch = request.path.match(/^\/api\/users\/([^/]+)$/);
      if (userMatch) {
        const roleError = requireRole(actorAwareRequest, 'user_write');
        if (roleError) return roleError;
        return handleUpdateUser(actorAwareRequest, dependencies, userMatch[1]);
      }

      const practitionerMatch = request.path.match(/^\/api\/practitioners\/([^/]+)$/);
      if (practitionerMatch) {
        const roleError = requireRole(actorAwareRequest, 'practitioner_write');
        if (roleError) return roleError;
        return handleUpdatePractitioner(actorAwareRequest, dependencies, practitionerMatch[1]);
      }

      const drugCatalogMatch = request.path.match(/^\/api\/drug-catalog\/([^/]+)$/);
      if (drugCatalogMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
        if (roleError) return roleError;
        return handleUpdateDrugCatalogItem(actorAwareRequest, dependencies, drugCatalogMatch[1]);
      }

      const inventoryItemStockMatch = request.path.match(/^\/api\/inventory-items\/([^/]+)\/stock$/);
      if (inventoryItemStockMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
        if (roleError) return roleError;
        return handleAdjustInventoryStock(actorAwareRequest, dependencies, inventoryItemStockMatch[1]);
      }

      const inventoryItemMatch = request.path.match(/^\/api\/inventory-items\/([^/]+)$/);
      if (inventoryItemMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
        if (roleError) return roleError;
        return handleUpdateInventoryItem(actorAwareRequest, dependencies, inventoryItemMatch[1]);
      }

      const inventoryLocationMatch = request.path.match(/^\/api\/inventory-locations\/([^/]+)$/);
      if (inventoryLocationMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
        if (roleError) return roleError;
        return handleUpdateInventoryLocation(
          actorAwareRequest,
          dependencies,
          inventoryLocationMatch[1]
        );
      }

      const supplierMatch = request.path.match(/^\/api\/suppliers\/([^/]+)$/);
      if (supplierMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
        if (roleError) return roleError;
        return handleUpdateSupplier(actorAwareRequest, dependencies, supplierMatch[1]);
      }

      const printerProfileMatch = request.path.match(/^\/api\/inventory-printer-profiles\/([^/]+)$/);
      if (printerProfileMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
        if (roleError) return roleError;
        return handleUpdateInventoryPrinterProfile(
          actorAwareRequest,
          dependencies,
          printerProfileMatch[1]
        );
      }

      const purchaseOrderMatch = request.path.match(/^\/api\/purchase-orders\/([^/]+)$/);
      if (purchaseOrderMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
        if (roleError) return roleError;
        return handleUpdatePurchaseOrder(actorAwareRequest, dependencies, purchaseOrderMatch[1]);
      }

      const approvalPolicyMatch = request.path.match(/^\/api\/purchase-order-approval-policies\/([^/]+)$/);
      if (approvalPolicyMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_catalog_write');
        if (roleError) return roleError;
        return handleUpdatePurchaseOrderApprovalPolicy(
          actorAwareRequest,
          dependencies,
          approvalPolicyMatch[1]
        );
      }

      const interactionRuleMatch = request.path.match(/^\/api\/drug-interaction-rules\/([^/]+)$/);
      if (interactionRuleMatch) {
        const roleError = requireRole(actorAwareRequest, 'drug_interaction_rule_write');
        if (roleError) return roleError;
        return handleUpdateDrugInteractionRule(
          actorAwareRequest,
          dependencies,
          interactionRuleMatch[1]
        );
      }

      const appointmentMatch = request.path.match(/^\/api\/appointments\/([^/]+)$/);
      if (appointmentMatch) {
        const roleError = requireRole(actorAwareRequest, 'appointment_write');
        if (roleError) return roleError;
        return handleUpdateAppointment(actorAwareRequest, dependencies, appointmentMatch[1]);
      }

      const visitMatch = request.path.match(/^\/api\/visits\/([^/]+)$/);
      if (visitMatch) {
        const roleError = requireRole(actorAwareRequest, 'appointment_write');
        if (roleError) return roleError;
        return handleUpdateClinicVisit(actorAwareRequest, dependencies, visitMatch[1]);
      }

      const encounterMatch = request.path.match(/^\/api\/encounters\/([^/]+)$/);
      if (encounterMatch) {
        const roleError = requireRole(actorAwareRequest, 'encounter_update');
        if (roleError) return roleError;
        return handleUpdateEncounter(actorAwareRequest, dependencies, encounterMatch[1]);
      }

      const consentMatch = request.path.match(/^\/api\/consents\/([^/]+)$/);
      if (consentMatch) {
        const roleError = requireRole(actorAwareRequest, 'consent_write');
        if (roleError) return roleError;
        return handleUpdateConsentRecord(actorAwareRequest, dependencies, consentMatch[1]);
      }

      const allergyMatch = request.path.match(/^\/api\/patient-allergies\/([^/]+)$/);
      if (allergyMatch) {
        const roleError = requireRole(actorAwareRequest, 'allergy_write');
        if (roleError) return roleError;
        return handleUpdatePatientAllergy(actorAwareRequest, dependencies, allergyMatch[1]);
      }

      const conditionMatch = request.path.match(/^\/api\/patient-conditions\/([^/]+)$/);
      if (conditionMatch) {
        const roleError = requireRole(actorAwareRequest, 'condition_write');
        if (roleError) return roleError;
        return handleUpdatePatientCondition(actorAwareRequest, dependencies, conditionMatch[1]);
      }

      const medicationMatch = request.path.match(/^\/api\/patient-medications\/([^/]+)$/);
      if (medicationMatch) {
        const roleError = requireRole(actorAwareRequest, 'medication_write');
        if (roleError) return roleError;
        return handleUpdatePatientMedication(actorAwareRequest, dependencies, medicationMatch[1]);
      }

      const flagMatch = request.path.match(/^\/api\/patient-flags\/([^/]+)$/);
      if (flagMatch) {
        const roleError = requireRole(actorAwareRequest, 'flag_write');
        if (roleError) return roleError;
        return handleUpdatePatientFlag(actorAwareRequest, dependencies, flagMatch[1]);
      }

      const templateMatch = request.path.match(/^\/api\/clinical-note-templates\/([^/]+)$/);
      if (templateMatch) {
        const roleError = requireRole(actorAwareRequest, 'soap_update');
        if (roleError) return roleError;
        return handleUpdateClinicalNoteTemplate(actorAwareRequest, dependencies, templateMatch[1]);
      }

      const clinicSettingsMatch = request.path.match(/^\/api\/clinics\/([^/]+)\/settings$/);
      if (clinicSettingsMatch) {
        const roleError = requireRole(actorAwareRequest, 'practitioner_write');
        if (roleError) return roleError;
        return handleUpsertClinicSettings(actorAwareRequest, dependencies, clinicSettingsMatch[1]);
      }

      const soapMatch = request.path.match(/^\/api\/clinical-notes\/([^/]+)\/soap$/);
      if (soapMatch) {
        const roleError = requireRole(actorAwareRequest, 'soap_update');
        if (roleError) return roleError;
        return handleUpdateSoapNote(actorAwareRequest, dependencies, soapMatch[1]);
      }

      const finalizeMatch = request.path.match(/^\/api\/clinical-notes\/([^/]+)\/finalize$/);
      if (finalizeMatch) {
        const roleError = requireRole(actorAwareRequest, 'clinical_note_finalize');
        if (roleError) return roleError;
        return handleFinalizeClinicalNote(actorAwareRequest, dependencies, finalizeMatch[1]);
      }

      const signMatch = request.path.match(/^\/api\/clinical-notes\/([^/]+)\/sign$/);
      if (signMatch) {
        const roleError = requireRole(actorAwareRequest, 'clinical_note_sign');
        if (roleError) return roleError;
        return handleSignClinicalNote(actorAwareRequest, dependencies, signMatch[1]);
      }

      const diagnosisMatch = request.path.match(/^\/api\/diagnoses\/([^/]+)$/);
      if (diagnosisMatch) {
        const roleError = requireRole(actorAwareRequest, 'diagnosis_update');
        if (roleError) return roleError;
        return handleUpdateDiagnosis(actorAwareRequest, dependencies, diagnosisMatch[1]);
      }

      const vitalSignMatch = request.path.match(/^\/api\/vital-signs\/([^/]+)$/);
      if (vitalSignMatch) {
        const roleError = requireRole(actorAwareRequest, 'vital_sign_update');
        if (roleError) return roleError;
        return handleUpdateVitalSign(actorAwareRequest, dependencies, vitalSignMatch[1]);
      }

      const prescriptionMatch = request.path.match(/^\/api\/prescriptions\/([^/]+)$/);
      if (prescriptionMatch) {
        const roleError = requireRole(actorAwareRequest, 'prescription_write');
        if (roleError) return roleError;
        return handleUpdatePrescription(actorAwareRequest, dependencies, prescriptionMatch[1]);
      }
    }

    if (request.method === 'DELETE') {
      const allergyMatch = request.path.match(/^\/api\/patient-allergies\/([^/]+)$/);
      if (allergyMatch) {
        const roleError = requireRole(actorAwareRequest, 'allergy_write');
        if (roleError) return roleError;
        return handleDeletePatientAllergy(actorAwareRequest, dependencies, allergyMatch[1]);
      }

      const conditionMatch = request.path.match(/^\/api\/patient-conditions\/([^/]+)$/);
      if (conditionMatch) {
        const roleError = requireRole(actorAwareRequest, 'condition_write');
        if (roleError) return roleError;
        return handleDeletePatientCondition(actorAwareRequest, dependencies, conditionMatch[1]);
      }

      const medicationMatch = request.path.match(/^\/api\/patient-medications\/([^/]+)$/);
      if (medicationMatch) {
        const roleError = requireRole(actorAwareRequest, 'medication_write');
        if (roleError) return roleError;
        return handleDeletePatientMedication(actorAwareRequest, dependencies, medicationMatch[1]);
      }

      const flagMatch = request.path.match(/^\/api\/patient-flags\/([^/]+)$/);
      if (flagMatch) {
        const roleError = requireRole(actorAwareRequest, 'flag_write');
        if (roleError) return roleError;
        return handleDeletePatientFlag(actorAwareRequest, dependencies, flagMatch[1]);
      }

      const soapMatch = request.path.match(/^\/api\/clinical-notes\/([^/]+)\/soap$/);
      if (soapMatch) {
        const roleError = requireRole(actorAwareRequest, 'soap_update');
        if (roleError) return roleError;
        return handleDeleteSoapNote(actorAwareRequest, dependencies, soapMatch[1]);
      }

      const diagnosisMatch = request.path.match(/^\/api\/diagnoses\/([^/]+)$/);
      if (diagnosisMatch) {
        const roleError = requireRole(actorAwareRequest, 'diagnosis_update');
        if (roleError) return roleError;
        return handleDeleteDiagnosis(actorAwareRequest, dependencies, diagnosisMatch[1]);
      }

      const vitalSignMatch = request.path.match(/^\/api\/vital-signs\/([^/]+)$/);
      if (vitalSignMatch) {
        const roleError = requireRole(actorAwareRequest, 'vital_sign_update');
        if (roleError) return roleError;
        return handleDeleteVitalSign(actorAwareRequest, dependencies, vitalSignMatch[1]);
      }

      const prescriptionMatch = request.path.match(/^\/api\/prescriptions\/([^/]+)$/);
      if (prescriptionMatch) {
        const roleError = requireRole(actorAwareRequest, 'prescription_write');
        if (roleError) return roleError;
        return handleDeletePrescription(actorAwareRequest, dependencies, prescriptionMatch[1]);
      }
    }

    return notFound();
}

async function auditSecurityResponse(
  request: HttpRequest,
  response: HttpResponse,
  dependencies: Dependencies
) {
  if (response.status !== 401 && response.status !== 403) {
    return;
  }
  if (request.path === '/api/auth/sessions') {
    return;
  }

  const actor = getActorContext(request);
  const error =
    response.body && typeof response.body === 'object' && 'error' in response.body
      ? String((response.body as { error?: unknown }).error ?? '')
      : '';

  try {
    await dependencies.createAuditLog({
      entityType: 'security_event',
      entityId: `${request.method} ${request.path}`,
      action: response.status === 401 ? 'auth_failed' : 'authorization_failed',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        method: request.method,
        path: request.path,
        status: response.status,
        error,
        oidcSubject: actor.oidcSubject,
        role: actor.role,
      },
    });
  } catch {
    // Security audit should not mask the original API response.
  }
}
