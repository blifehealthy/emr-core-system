import test from 'node:test';
import assert from 'node:assert/strict';
import { assessPrescriptionSafety } from './assessPrescriptionSafety.ts';

test('assessPrescriptionSafety returns allergy warnings from catalog tags', async () => {
  const service = assessPrescriptionSafety({
    async query<T>(sql: string) {
      if (sql.includes('FROM patient_allergies')) {
        return {
          rows: [
            {
              id: 'allergy-1',
              allergen_name: 'Penicillin',
              reaction: 'rash',
              severity: 'severe',
              criticality: 'high',
            },
          ] as T[],
        };
      }

      if (sql.includes('FROM drug_interaction_rules') || sql.includes('FROM patient_medications')) {
        return { rows: [] as T[] };
      }

      return {
        rows: [
          {
            id: 'drug-1',
            medication_name: 'Amoxicillin',
            generic_name: 'amoxicillin',
            rxnorm_code: 'RX-1',
            allergen_tags: ['penicillin'],
          },
        ] as T[],
      };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    medicationName: 'Amoxicillin',
    rxnormCode: 'RX-1',
  });

  assert.equal(result.drugCatalogId, 'drug-1');
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].severity, 'critical');
  assert.equal(result.warnings[0].allergenName, 'Penicillin');
});

test('assessPrescriptionSafety returns interaction warnings from active medications', async () => {
  const service = assessPrescriptionSafety({
    async query<T>(sql: string) {
      if (sql.includes('FROM patient_allergies')) {
        return { rows: [] as T[] };
      }

      if (sql.includes('FROM drug_catalog')) {
        return {
          rows: [
            {
              id: 'drug-warfarin',
              medication_name: 'Warfarin',
              generic_name: 'warfarin',
              rxnorm_code: 'RX-WARFARIN',
              allergen_tags: [],
            },
          ] as T[],
        };
      }

      if (sql.includes('FROM drug_interaction_rules')) {
        return {
          rows: [
            {
              id: 'rule-1',
              primary_rxnorm_code: 'RX-WARFARIN',
              interacting_medication_name: 'Ibuprofen',
              severity: 'critical',
              description: 'Increased bleeding risk',
              recommendation: 'Avoid combination',
            },
          ] as T[],
        };
      }

      return {
        rows: [
          {
            source: 'medication',
            id: 'med-1',
            medication_name: 'Ibuprofen',
            rxnorm_code: null,
          },
        ] as T[],
      };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    medicationName: 'Warfarin',
    rxnormCode: 'RX-WARFARIN',
  });

  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].type, 'interaction');
  assert.equal(result.warnings[0].severity, 'critical');
  assert.equal(result.warnings[0].interactingMedicationName, 'Ibuprofen');
});
