# UAT Test Data Plan

เอกสารนี้ใช้เตรียมข้อมูลทดสอบก่อนเริ่ม UAT เพื่อให้ทุก role ทดสอบ scenario
เดียวกันและเทียบผลได้

## หลักการ

- ใช้ข้อมูลทดสอบเท่านั้น
- ห้ามใช้ข้อมูลผู้ป่วยจริงถ้าไม่ได้รับอนุมัติ
- ทุกข้อมูลต้องมี owner และ expected result
- ถ้าต้องลบหรือ reset ให้ IT เป็นผู้ทำ

## Clinic And Users

| Data | Example | Owner | Ready |
| --- | --- | --- | --- |
| Clinic ID | `clinic-uat-001` | IT/Admin | |
| Admin user | `admin.uat` | IT/Admin | |
| Doctor user | `doctor.uat` | IT/Admin | |
| Nurse/front desk user | `nurse.uat` | IT/Admin | |
| Pharmacy user | `pharmacy.uat` | IT/Admin | |
| Cashier user | `cashier.uat` | IT/Admin | |
| Witness user | `witness.uat` | IT/Admin | |

## Patients

| Patient | Purpose | Required data |
| --- | --- | --- |
| UAT-P001 | normal clinical flow | no allergy, no chronic condition |
| UAT-P002 | allergy warning | allergy to test drug |
| UAT-P003 | chronic condition/medication | condition and active medication |
| UAT-P004 | billing test | completed encounter ready for invoice |
| UAT-P005 | controlled drug test | prescription for controlled item |

## Clinical Data

| Data | Purpose | Expected result |
| --- | --- | --- |
| Allergy: Penicillin | trigger drug allergy warning | warning visible before prescribing/dispense |
| Condition: Hypertension | clinical profile display | appears in patient detail |
| Active medication | interaction warning | warning if interaction rule exists |
| SOAP template | doctor workflow | template selectable while writing note |
| Diagnosis sample | billing/reporting | appears in encounter and daily report |

## Drug Catalog

| Drug | Purpose | Required fields |
| --- | --- | --- |
| Amoxicillin 500mg | allergy warning and normal dispense | barcode, unit, active |
| Paracetamol 500mg | normal stock/dispense | barcode, unit, active |
| Diazepam 5mg | controlled substance test | controlled flag, schedule |
| Warfarin | interaction rule test | active drug |
| Aspirin | interaction rule test | active drug |

## Inventory And Lots

| Item | Lot | Expiry | Quantity | Purpose |
| --- | --- | --- | --- | --- |
| Paracetamol | LOT-PARA-GOOD | future date | 100 | normal dispense |
| Paracetamol | LOT-PARA-OLD | expired date | 10 | expiry guard |
| Amoxicillin | LOT-AMOX-FEFO | earliest future date | 50 | FEFO recommended |
| Amoxicillin | LOT-AMOX-LATE | later future date | 50 | non-FEFO override |
| Diazepam | LOT-DIAZ-CTRL | future date | 20 | controlled dispense/reconcile |

## Locations And Bins

| Location | Type | Purpose |
| --- | --- | --- |
| MAIN-PHARMACY | pharmacy | default stock |
| DISPENSE-COUNTER | counter | dispense location |
| COLD-CHAIN | storage | label/bin test |
| QUARANTINE | holding | transfer/cancel test |

## Barcode And GS1

| Barcode | Purpose | Expected |
| --- | --- | --- |
| `ITEM-PARA-001` | item barcode | matches item |
| `LOT-PARA-GOOD` | lot barcode | matches lot |
| GS1 with GTIN + expiry + lot | GS1 parser | shows GTIN, expiry, lot |
| Unknown barcode | negative test | not matched |

## Printer Data

| Data | Purpose | Expected |
| --- | --- | --- |
| Browser printer profile | manual export | delivery `exported` |
| Utility bridge profile | bridge queue | delivery `queued` |
| Label template: item | item label | title/barcode visible |
| Label template: lot | lot label | lot/expiry visible |
| Failed print job | fallback test | can browser/manual fallback |
| Retried print job | retry test | returns to queue/export |

## Billing Data

| Case | Purpose | Expected |
| --- | --- | --- |
| Encounter with visit charge | invoice from encounter | line item created |
| Medication charge | charge capture | medication line created |
| Partial payment | payment status | partially paid |
| Full payment | payment status | paid |
| Refund | refund audit | refund visible |
| Void invoice | void workflow | status voided with reason |

## Reports

| Report | Required data |
| --- | --- |
| Daily operations | visits, diagnoses, prescriptions |
| Billing summary | invoices, payments, refunds |
| Pharmacy overrides | FEFO/expiry override rows |
| Controlled substances | receiving/dispense/transfer events |
| Printer bridge health | queued/failed/fallback/retry print jobs |

## Data Readiness Sign-Off

| Area | Owner | Ready | Note |
| --- | --- | --- | --- |
| Users/roles | IT/Admin | | |
| Patients | Clinical/Admin | | |
| Drug catalog | Pharmacy | | |
| Inventory/lots | Pharmacy | | |
| Printer/scanner | IT/Pharmacy | | |
| Billing | Cashier/Accounting | | |
| Reports | UAT lead | | |
