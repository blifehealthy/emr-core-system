import { getActorContext, requireBearerAuth, withResolvedActor } from './auth.ts';
import {
  handleCreateDiagnosis,
  handleCreatePractitioner,
  handleCreatePrescription,
  handleCreateEncounter,
  handleCreateUser,
  handleCreateVitalSign,
  handleDeleteDiagnosis,
  handleDeletePrescription,
  handleDeleteSoapNote,
  handleDeleteVitalSign,
  handleFinalizeClinicalNote,
  handleGetAuditLogsByEntity,
  handleGetDiagnosis,
  handleGetPatientDetail,
  handleGetPatientTimeline,
  handleGetPrescription,
  handleGetSoapNote,
  handleGetVitalSign,
  handleHealthCheck,
  handleListDiagnosesByEncounter,
  handleListPractitioners,
  handleListPrescriptionsByEncounter,
  handleListUsers,
  handleListVitalSignsByEncounter,
  handleSignClinicalNote,
  handleUpdatePractitioner,
  handleUpdatePrescription,
  handleUpdateDiagnosis,
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

    if (request.method === 'POST' && request.path === '/api/encounters') {
      const roleError = requireRole(actorAwareRequest, 'encounter_create');
      if (roleError) return roleError;
      return handleCreateEncounter(actorAwareRequest, dependencies);
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

    if (request.method === 'POST' && request.path === '/api/diagnoses') {
      const roleError = requireRole(actorAwareRequest, 'diagnosis_update');
      if (roleError) return roleError;
      return handleCreateDiagnosis(actorAwareRequest, dependencies);
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
