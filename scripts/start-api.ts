import { createNodeServer } from '../backend/api/nodeServer.ts';
import { createPostgresDb } from '../backend/database/postgres.ts';
import { createAuditLog } from '../backend/services/createAuditLog.ts';
import { createAuthSession } from '../backend/services/createAuthSession.ts';
import { createAppointment } from '../backend/services/createAppointment.ts';
import { createClinicVisit } from '../backend/services/createClinicVisit.ts';
import { createClinicalNoteTemplate } from '../backend/services/createClinicalNoteTemplate.ts';
import { createAttachmentLink } from '../backend/services/createAttachmentLink.ts';
import { createConsentRecord } from '../backend/services/createConsentRecord.ts';
import { createDiagnosis } from '../backend/services/createDiagnosis.ts';
import { createDrugCatalogItem } from '../backend/services/createDrugCatalogItem.ts';
import { createDrugInteractionRule } from '../backend/services/createDrugInteractionRule.ts';
import {
  createChargeTemplate,
  listChargeTemplates,
  updateChargeTemplate,
} from '../backend/services/chargeTemplates.ts';
import { createFileAsset } from '../backend/services/createFileAsset.ts';
import { createInvoice, getInvoiceById } from '../backend/services/createInvoice.ts';
import { createInvoiceFromEncounter } from '../backend/services/createInvoiceFromEncounter.ts';
import { createEncounterWithSOAP } from '../backend/services/createEncounterWithSOAP.ts';
import { createPatient } from '../backend/services/createPatient.ts';
import { createPatientAllergy } from '../backend/services/createPatientAllergy.ts';
import { createPatientCondition } from '../backend/services/createPatientCondition.ts';
import { createPatientFlag } from '../backend/services/createPatientFlag.ts';
import { createPatientMedication } from '../backend/services/createPatientMedication.ts';
import { createPractitioner } from '../backend/services/createPractitioner.ts';
import { createPrescription } from '../backend/services/createPrescription.ts';
import { createUser } from '../backend/services/createUser.ts';
import { createVitalSign } from '../backend/services/createVitalSign.ts';
import { assessPrescriptionSafety } from '../backend/services/assessPrescriptionSafety.ts';
import { finalizeClinicalNote } from '../backend/services/finalizeClinicalNote.ts';
import {
  createDownloadFileAssetContentService,
  createUploadFileAssetService,
} from '../backend/services/fileAssetStorage.ts';
import { createFileAssetStoragePolicy } from '../backend/services/fileAssetStoragePolicy.ts';
import { getAuditLogsByEntity } from '../backend/services/getAuditLogsByEntity.ts';
import { getAppointmentById } from '../backend/services/getAppointmentById.ts';
import { getClinicSettings } from '../backend/services/getClinicSettings.ts';
import { getConsentRecordById } from '../backend/services/getConsentRecordById.ts';
import { getDailyOperationsReport } from '../backend/services/getDailyOperationsReport.ts';
import { getDiagnosisById } from '../backend/services/getDiagnosisById.ts';
import { getEncounterById } from '../backend/services/getEncounterById.ts';
import { getFileAssetById } from '../backend/services/getFileAssetById.ts';
import { getPatientAllergyById } from '../backend/services/getPatientAllergyById.ts';
import { getPatientConditionById } from '../backend/services/getPatientConditionById.ts';
import { getPatientFlagById } from '../backend/services/getPatientFlagById.ts';
import { getPatientMedicationById } from '../backend/services/getPatientMedicationById.ts';
import { createGetPatientWithEncountersAndSOAPService } from '../backend/services/getPatientWithEncountersAndSOAP.ts';
import { getPatientTimeline } from '../backend/services/getPatientTimeline.ts';
import { getPrescriptionById } from '../backend/services/getPrescriptionById.ts';
import { getSoapNoteByClinicalNoteId } from '../backend/services/getSoapNoteByClinicalNoteId.ts';
import { getVitalSignById } from '../backend/services/getVitalSignById.ts';
import { listAttachmentsByTarget } from '../backend/services/listAttachmentsByTarget.ts';
import { listAppointments } from '../backend/services/listAppointments.ts';
import { listClinicQueue } from '../backend/services/listClinicQueue.ts';
import { listClinicalNoteTemplates } from '../backend/services/listClinicalNoteTemplates.ts';
import { listConsentRecordsByPatient } from '../backend/services/listConsentRecordsByPatient.ts';
import { listDiagnosesByEncounter } from '../backend/services/listDiagnosesByEncounter.ts';
import { listDrugCatalog } from '../backend/services/listDrugCatalog.ts';
import { listDrugInteractionRules } from '../backend/services/listDrugInteractionRules.ts';
import { listFileAssets } from '../backend/services/listFileAssets.ts';
import { listInvoices } from '../backend/services/listInvoices.ts';
import { listPatientAllergies } from '../backend/services/listPatientAllergies.ts';
import { listPatientConditions } from '../backend/services/listPatientConditions.ts';
import { listPatientFlags } from '../backend/services/listPatientFlags.ts';
import { listPatientMedications } from '../backend/services/listPatientMedications.ts';
import { listPractitioners } from '../backend/services/listPractitioners.ts';
import { listPrescriptionsByEncounter } from '../backend/services/listPrescriptionsByEncounter.ts';
import { listUsers } from '../backend/services/listUsers.ts';
import { listVitalSignsByEncounter } from '../backend/services/listVitalSignsByEncounter.ts';
import { signClinicalNote } from '../backend/services/signClinicalNote.ts';
import { softDeleteDiagnosis } from '../backend/services/softDeleteDiagnosis.ts';
import { softDeletePatientAllergy } from '../backend/services/softDeletePatientAllergy.ts';
import { softDeletePatientCondition } from '../backend/services/softDeletePatientCondition.ts';
import { softDeletePatientFlag } from '../backend/services/softDeletePatientFlag.ts';
import { softDeletePatientMedication } from '../backend/services/softDeletePatientMedication.ts';
import { softDeletePrescription } from '../backend/services/softDeletePrescription.ts';
import { softDeleteSoapNote } from '../backend/services/softDeleteSoapNote.ts';
import { softDeleteVitalSign } from '../backend/services/softDeleteVitalSign.ts';
import { updateAppointment } from '../backend/services/updateAppointment.ts';
import { updateClinicVisit } from '../backend/services/updateClinicVisit.ts';
import { updateClinicalNoteTemplate } from '../backend/services/updateClinicalNoteTemplate.ts';
import { updateConsentRecord } from '../backend/services/updateConsentRecord.ts';
import { updateDiagnosis } from '../backend/services/updateDiagnosis.ts';
import { updateDrugCatalogItem } from '../backend/services/updateDrugCatalogItem.ts';
import { updateDrugInteractionRule } from '../backend/services/updateDrugInteractionRule.ts';
import { updateEncounter } from '../backend/services/updateEncounter.ts';
import { updatePatientAllergy } from '../backend/services/updatePatientAllergy.ts';
import { updatePatientCondition } from '../backend/services/updatePatientCondition.ts';
import { updatePatientFlag } from '../backend/services/updatePatientFlag.ts';
import { updatePatientMedication } from '../backend/services/updatePatientMedication.ts';
import { updatePractitioner } from '../backend/services/updatePractitioner.ts';
import { updatePrescription } from '../backend/services/updatePrescription.ts';
import { updateSoapNote } from '../backend/services/updateSoapNote.ts';
import { updateUser } from '../backend/services/updateUser.ts';
import { updateVitalSign } from '../backend/services/updateVitalSign.ts';
import { upsertClinicSettings } from '../backend/services/upsertClinicSettings.ts';
import { resolveActor } from '../backend/services/resolveActor.ts';
import { resolveOidcActor } from '../backend/services/resolveOidcActor.ts';
import { recordInvoicePayment } from '../backend/services/recordInvoicePayment.ts';
import { recordInvoiceRefund } from '../backend/services/recordInvoiceRefund.ts';
import { updateInvoice } from '../backend/services/updateInvoice.ts';
import {
  createInsuranceClaim,
  listInsuranceClaims,
  updateInsuranceClaim,
} from '../backend/services/insuranceClaims.ts';
import { voidInvoice } from '../backend/services/voidInvoice.ts';
import { createOidcJwksCache } from '../backend/services/oidcJwks.ts';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to start the API server');
}

const db = createPostgresDb(databaseUrl);
const fileStoragePolicy = createFileAssetStoragePolicy(process.env);
const oidcPublicKeysByKid = process.env.AUTH_OIDC_JWKS_URL
  ? (await createOidcJwksCache({
      jwksUrl: process.env.AUTH_OIDC_JWKS_URL,
      cacheTtlMs: Number(process.env.AUTH_OIDC_JWKS_CACHE_TTL_SECONDS ?? 3600) * 1000,
    }).getPublicKeys()).publicKeysByKid
  : undefined;

const server = createNodeServer({
  getPatientWithEncountersAndSOAP: createGetPatientWithEncountersAndSOAPService(db),
  createAuthSession: createAuthSession(db, {
    loginCode: process.env.AUTH_LOGIN_CODE,
    sessionSecret: process.env.AUTH_SESSION_SECRET,
    ttlMinutes: Number(process.env.AUTH_SESSION_TTL_MINUTES ?? 480),
  }),
  createPatient: createPatient(db),
  getConsentRecordById: getConsentRecordById(db),
  getFileAssetById: getFileAssetById(db),
  getPatientAllergyById: getPatientAllergyById(db),
  getPatientConditionById: getPatientConditionById(db),
  getPatientFlagById: getPatientFlagById(db),
  getPatientMedicationById: getPatientMedicationById(db),
  getAppointmentById: getAppointmentById(db),
  getClinicSettings: getClinicSettings(db),
  getDailyOperationsReport: getDailyOperationsReport(db),
  getEncounterById: getEncounterById(db),
  getSoapNoteByClinicalNoteId: getSoapNoteByClinicalNoteId(db),
  getDiagnosisById: getDiagnosisById(db),
  getVitalSignById: getVitalSignById(db),
  getPrescriptionById: getPrescriptionById(db),
  listAppointments: listAppointments(db),
  listClinicQueue: listClinicQueue(db),
  listClinicalNoteTemplates: listClinicalNoteTemplates(db),
  listAttachmentsByTarget: listAttachmentsByTarget(db),
  listFileAssets: listFileAssets(db),
  listConsentRecordsByPatient: listConsentRecordsByPatient(db),
  listPatientAllergies: listPatientAllergies(db),
  listPatientConditions: listPatientConditions(db),
  listPatientFlags: listPatientFlags(db),
  listPatientMedications: listPatientMedications(db),
  listDiagnosesByEncounter: listDiagnosesByEncounter(db),
  listVitalSignsByEncounter: listVitalSignsByEncounter(db),
  createAppointment: createAppointment(db),
  createClinicVisit: createClinicVisit(db),
  createClinicalNoteTemplate: createClinicalNoteTemplate(db),
  createAttachmentLink: createAttachmentLink(db),
  createConsentRecord: createConsentRecord(db),
  createFileAsset: createFileAsset(db),
  uploadFileAsset: createUploadFileAssetService(db, fileStoragePolicy),
  downloadFileAssetContent: createDownloadFileAssetContentService(db, fileStoragePolicy),
  getFileAssetStoragePolicy: () => ({
    driver: fileStoragePolicy.driver,
    maxUploadBytes: fileStoragePolicy.maxUploadBytes,
    allowedMimeTypes: fileStoragePolicy.allowedMimeTypes,
  }),
  createPatientAllergy: createPatientAllergy(db),
  createPatientCondition: createPatientCondition(db),
  createPatientFlag: createPatientFlag(db),
  createPatientMedication: createPatientMedication(db),
  listUsers: listUsers(db),
  createUser: createUser(db),
  updateAppointment: updateAppointment(db),
  updateClinicVisit: updateClinicVisit(db),
  updateClinicalNoteTemplate: updateClinicalNoteTemplate(db),
  updateEncounter: updateEncounter(db),
  updateConsentRecord: updateConsentRecord(db),
  updatePatientAllergy: updatePatientAllergy(db),
  updatePatientCondition: updatePatientCondition(db),
  updatePatientFlag: updatePatientFlag(db),
  updatePatientMedication: updatePatientMedication(db),
  updateUser: updateUser(db),
  listPractitioners: listPractitioners(db),
  createPractitioner: createPractitioner(db),
  updatePractitioner: updatePractitioner(db),
  listDrugCatalog: listDrugCatalog(db),
  createDrugCatalogItem: createDrugCatalogItem(db),
  updateDrugCatalogItem: updateDrugCatalogItem(db),
  listDrugInteractionRules: listDrugInteractionRules(db),
  createDrugInteractionRule: createDrugInteractionRule(db),
  updateDrugInteractionRule: updateDrugInteractionRule(db),
  assessPrescriptionSafety: assessPrescriptionSafety(db),
  listPrescriptionsByEncounter: listPrescriptionsByEncounter(db),
  createPrescription: createPrescription(db),
  listInvoices: listInvoices(db),
  getInvoiceById: getInvoiceById(db),
  createInvoice: createInvoice(db),
  updateInvoice: updateInvoice(db),
  createInvoiceFromEncounter: createInvoiceFromEncounter(db),
  recordInvoicePayment: recordInvoicePayment(db),
  recordInvoiceRefund: recordInvoiceRefund(db),
  voidInvoice: voidInvoice(db),
  listChargeTemplates: listChargeTemplates(db),
  createChargeTemplate: createChargeTemplate(db),
  updateChargeTemplate: updateChargeTemplate(db),
  listInsuranceClaims: listInsuranceClaims(db),
  createInsuranceClaim: createInsuranceClaim(db),
  updateInsuranceClaim: updateInsuranceClaim(db),
  createDiagnosis: createDiagnosis(db),
  createVitalSign: createVitalSign(db),
  updatePrescription: updatePrescription(db),
  createEncounterWithSOAP: createEncounterWithSOAP(db),
  updateSoapNote: updateSoapNote(db),
  updateDiagnosis: updateDiagnosis(db),
  updateVitalSign: updateVitalSign(db),
  upsertClinicSettings: upsertClinicSettings(db),
  softDeleteSoapNote: softDeleteSoapNote(db),
  softDeletePatientAllergy: softDeletePatientAllergy(db),
  softDeletePatientCondition: softDeletePatientCondition(db),
  softDeletePatientFlag: softDeletePatientFlag(db),
  softDeletePatientMedication: softDeletePatientMedication(db),
  softDeleteDiagnosis: softDeleteDiagnosis(db),
  softDeleteVitalSign: softDeleteVitalSign(db),
  softDeletePrescription: softDeletePrescription(db),
  finalizeClinicalNote: finalizeClinicalNote(db),
  signClinicalNote: signClinicalNote(db),
  createAuditLog: createAuditLog(db),
  getAuditLogsByEntity: getAuditLogsByEntity(db),
  getPatientTimeline: getPatientTimeline(db),
  resolveActor: resolveActor(db),
  resolveOidcActor: resolveOidcActor(db),
  healthCheck: () => db.healthCheck(),
  apiToken: process.env.API_TOKEN,
  sessionAuthSecret: process.env.AUTH_SESSION_SECRET,
  oidcAuth:
    process.env.AUTH_OIDC_ISSUER &&
    process.env.AUTH_OIDC_AUDIENCE &&
    (process.env.AUTH_OIDC_HS256_SECRET ||
      process.env.AUTH_OIDC_RS256_PUBLIC_KEY_PEM ||
      oidcPublicKeysByKid)
      ? {
          issuer: process.env.AUTH_OIDC_ISSUER,
          audience: process.env.AUTH_OIDC_AUDIENCE,
          hs256Secret: process.env.AUTH_OIDC_HS256_SECRET,
          rs256PublicKeyPem: process.env.AUTH_OIDC_RS256_PUBLIC_KEY_PEM,
          rs256PublicKeysByKid: oidcPublicKeysByKid,
          subjectClaim: process.env.AUTH_OIDC_SUBJECT_CLAIM,
          requiredMfaClaim:
            process.env.AUTH_OIDC_MFA_REQUIRED === 'true'
              ? process.env.AUTH_OIDC_MFA_CLAIM ?? 'acr'
              : undefined,
          requiredMfaValues:
            process.env.AUTH_OIDC_MFA_VALUES?.split(',')
              .map((value) => value.trim())
              .filter(Boolean),
        }
      : undefined,
});

const port = Number(process.env.PORT ?? '3000');

server.listen(port, () => {
  console.log(`EMR API listening on http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    server.close();
    await db.close();
    process.exit(0);
  });
}
