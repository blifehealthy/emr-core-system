# Phase 2 Pilot Go/No-Go

ใช้เอกสารนี้เป็น template สำหรับบันทึกการตัดสินใจหลัง UAT รวม Phase 2A-2G

## สถานะ

Phase 2 implementation scope ปิดแล้ว และพร้อมใช้เอกสารนี้สำหรับรอบ pilot closure

ผลการตัดสินใจจริงให้เลือกหลัง UAT:

- `GO`
- `GO WITH NOTES`
- `NO-GO`

## Required Checks

ก่อนเลือก `GO` ต้องผ่าน:

- `docs/phase-2-uat-master-checklist-th.md`
- `docs/production-readiness-checklist.md`
- `docs/monitoring-backup-runbook.md`
- `docs/identity-security-operations-runbook.md`

## Technical Verification

บันทึกผลล่าสุด:

- `npx tsc --noEmit`: ผ่าน
- `npm test`: ผ่าน
- `npm run api:smoke`: ผ่าน
- `PRODUCTION_READINESS_STRICT=true npm run production:check`: ต้องรันกับ environment จริงก่อน pilot
- `npm run browser:api-workflow-smoke`: แนะนำให้รันก่อน pilot เมื่อ Chrome/Docker พร้อม

## Clinical Sign-Off

ผู้รับผิดชอบ:

- Doctor owner:
- Nurse/clinic staff representative:
- Clinic admin:

ต้องยืนยัน:

- registration/check-in/queue flow รับได้
- SOAP/diagnosis/vitals/prescription flow รับได้
- prescription warning/override flow รับได้
- prescription print/export รับได้
- report/export wording รับได้

## Operations Sign-Off

ผู้รับผิดชอบ:

- Deployment operator:
- Backup/restore owner:
- Identity provider contact:
- Incident owner:

ต้องยืนยัน:

- storage path/bucket เป็น production-safe
- backup schedule พร้อม
- restore drill ผ่าน
- identity provider config พร้อม
- MFA policy พร้อม
- security event audit lookup พร้อม
- downtime/manual fallback พร้อม

## Blocker Log

| ID | Area | Issue | Owner | Status |
| --- | --- | --- | --- | --- |
| B-001 | TBD | TBD | TBD | Open |

## Non-Blocking Notes

| ID | Area | Note | Owner | Follow-Up Phase |
| --- | --- | --- | --- | --- |
| N-001 | TBD | TBD | TBD | Phase 3 |

## Decision

Decision:

Decision date:

Approvers:

Notes:

## Recommended Next Step

ถ้า `GO`:

- freeze Phase 2 scope
- deploy to pilot environment
- monitor audit/security/backup closely during pilot
- start Phase 3 planning

ถ้า `GO WITH NOTES`:

- track notes as explicit non-blocking follow-ups
- assign owner and date
- do not add new scope before pilot unless safety-critical

ถ้า `NO-GO`:

- fix blockers only
- rerun UAT sections affected by the fixes
- rerun technical verification
