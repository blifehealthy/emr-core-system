import { getActorContext, requireBearerAuth, withResolvedActor } from './auth.ts';
import {
  handleCreateAttachmentLink,
  handleCreateAppointment,
  handleCreateConsentRecord,
  handleCreateFileAsset,
  handleCreateDiagnosis,
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
  handleGetConsentRecord,
  handleGetDiagnosis,
  handleGetEncounter,
  handleGetFileAsset,
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
  handleListConsentRecordsByPatient,
  handleListDiagnosesByEncounter,
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
  handleUpdateConsentRecord,
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
  notFound,
} from './controllers.ts';
import { requireRole } from './auth.ts';
import type { Dependencies, HttpRequest, HttpResponse } from './types.ts';

export type { Dependencies, HttpRequest, HttpResponse } from './types.ts';

export function createEmrApi(dependencies: Dependencies) {
  return async function handleRequest(request: HttpRequest): Promise<HttpResponse> {
    if (request.method === 'GET' && request.path === '/health') {
      return handleHealthCheck(dependencies);
    }

    const authError = requireBearerAuth(request, dependencies.apiToken);

    if (authError) {
      return authError;
    }

    let actorAwareRequest = request;
    const actor = getActorContext(request);

    if (dependencies.resolveActor) {
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

    if (request.method === 'GET' && request.path === '/api/attachments') {
      const roleError = requireRole(actorAwareRequest, 'attachment_read');
      if (roleError) return roleError;
      return handleListAttachments(actorAwareRequest, dependencies);
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

    const consentReadMatch =
      request.method === 'GET' ? request.path.match(/^\/api\/consents\/([^/]+)$/) : null;
    if (consentReadMatch) {
      const roleError = requireRole(actorAwareRequest, 'consent_read');
      if (roleError) return roleError;
      return handleGetConsentRecord(actorAwareRequest, dependencies, consentReadMatch[1]);
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

    if (request.method === 'POST' && request.path === '/api/prescriptions') {
      const roleError = requireRole(actorAwareRequest, 'prescription_write');
      if (roleError) return roleError;
      return handleCreatePrescription(actorAwareRequest, dependencies);
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

      const appointmentMatch = request.path.match(/^\/api\/appointments\/([^/]+)$/);
      if (appointmentMatch) {
        const roleError = requireRole(actorAwareRequest, 'appointment_write');
        if (roleError) return roleError;
        return handleUpdateAppointment(actorAwareRequest, dependencies, appointmentMatch[1]);
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
  };
}
