import { createNodeServer } from '../backend/api/nodeServer.ts';
import { createPostgresDb } from '../backend/database/postgres.ts';
import { createAuditLog } from '../backend/services/createAuditLog.ts';
import { createAppointment } from '../backend/services/createAppointment.ts';
import { createClinicVisit } from '../backend/services/createClinicVisit.ts';
import { createClinicalNoteTemplate } from '../backend/services/createClinicalNoteTemplate.ts';
import { createAttachmentLink } from '../backend/services/createAttachmentLink.ts';
import { createConsentRecord } from '../backend/services/createConsentRecord.ts';
import { createDiagnosis } from '../backend/services/createDiagnosis.ts';
import { createFileAsset } from '../backend/services/createFileAsset.ts';
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
import { finalizeClinicalNote } from '../backend/services/finalizeClinicalNote.ts';
import {
  createDownloadFileAssetContentService,
  createUploadFileAssetService,
} from '../backend/services/fileAssetStorage.ts';
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
import { listFileAssets } from '../backend/services/listFileAssets.ts';
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

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to start the API server');
}

const db = createPostgresDb(databaseUrl);
const fileStorageRoot = process.env.FILE_STORAGE_DIR ?? '/tmp/emr-core-file-assets';

const server = createNodeServer({
  getPatientWithEncountersAndSOAP: createGetPatientWithEncountersAndSOAPService(db),
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
  uploadFileAsset: createUploadFileAssetService(db, fileStorageRoot),
  downloadFileAssetContent: createDownloadFileAssetContentService(db, fileStorageRoot),
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
  listPrescriptionsByEncounter: listPrescriptionsByEncounter(db),
  createPrescription: createPrescription(db),
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
  healthCheck: () => db.healthCheck(),
  apiToken: process.env.API_TOKEN,
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
