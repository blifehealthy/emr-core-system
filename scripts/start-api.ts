import { createNodeServer } from '../backend/api/nodeServer.ts';
import { createPostgresDb } from '../backend/database/postgres.ts';
import { createAuditLog } from '../backend/services/createAuditLog.ts';
import { createAppointment } from '../backend/services/createAppointment.ts';
import { createDiagnosis } from '../backend/services/createDiagnosis.ts';
import { createEncounterWithSOAP } from '../backend/services/createEncounterWithSOAP.ts';
import { createPractitioner } from '../backend/services/createPractitioner.ts';
import { createPrescription } from '../backend/services/createPrescription.ts';
import { createUser } from '../backend/services/createUser.ts';
import { createVitalSign } from '../backend/services/createVitalSign.ts';
import { finalizeClinicalNote } from '../backend/services/finalizeClinicalNote.ts';
import { getAuditLogsByEntity } from '../backend/services/getAuditLogsByEntity.ts';
import { getAppointmentById } from '../backend/services/getAppointmentById.ts';
import { getDiagnosisById } from '../backend/services/getDiagnosisById.ts';
import { createGetPatientWithEncountersAndSOAPService } from '../backend/services/getPatientWithEncountersAndSOAP.ts';
import { getPatientTimeline } from '../backend/services/getPatientTimeline.ts';
import { getPrescriptionById } from '../backend/services/getPrescriptionById.ts';
import { getSoapNoteByClinicalNoteId } from '../backend/services/getSoapNoteByClinicalNoteId.ts';
import { getVitalSignById } from '../backend/services/getVitalSignById.ts';
import { listAppointments } from '../backend/services/listAppointments.ts';
import { listDiagnosesByEncounter } from '../backend/services/listDiagnosesByEncounter.ts';
import { listPractitioners } from '../backend/services/listPractitioners.ts';
import { listPrescriptionsByEncounter } from '../backend/services/listPrescriptionsByEncounter.ts';
import { listUsers } from '../backend/services/listUsers.ts';
import { listVitalSignsByEncounter } from '../backend/services/listVitalSignsByEncounter.ts';
import { signClinicalNote } from '../backend/services/signClinicalNote.ts';
import { softDeleteDiagnosis } from '../backend/services/softDeleteDiagnosis.ts';
import { softDeletePrescription } from '../backend/services/softDeletePrescription.ts';
import { softDeleteSoapNote } from '../backend/services/softDeleteSoapNote.ts';
import { softDeleteVitalSign } from '../backend/services/softDeleteVitalSign.ts';
import { updateAppointment } from '../backend/services/updateAppointment.ts';
import { updateDiagnosis } from '../backend/services/updateDiagnosis.ts';
import { updatePractitioner } from '../backend/services/updatePractitioner.ts';
import { updatePrescription } from '../backend/services/updatePrescription.ts';
import { updateSoapNote } from '../backend/services/updateSoapNote.ts';
import { updateUser } from '../backend/services/updateUser.ts';
import { updateVitalSign } from '../backend/services/updateVitalSign.ts';
import { resolveActor } from '../backend/services/resolveActor.ts';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to start the API server');
}

const db = createPostgresDb(databaseUrl);

const server = createNodeServer({
  getPatientWithEncountersAndSOAP: createGetPatientWithEncountersAndSOAPService(db),
  getAppointmentById: getAppointmentById(db),
  getSoapNoteByClinicalNoteId: getSoapNoteByClinicalNoteId(db),
  getDiagnosisById: getDiagnosisById(db),
  getVitalSignById: getVitalSignById(db),
  getPrescriptionById: getPrescriptionById(db),
  listAppointments: listAppointments(db),
  listDiagnosesByEncounter: listDiagnosesByEncounter(db),
  listVitalSignsByEncounter: listVitalSignsByEncounter(db),
  createAppointment: createAppointment(db),
  listUsers: listUsers(db),
  createUser: createUser(db),
  updateAppointment: updateAppointment(db),
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
  softDeleteSoapNote: softDeleteSoapNote(db),
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
