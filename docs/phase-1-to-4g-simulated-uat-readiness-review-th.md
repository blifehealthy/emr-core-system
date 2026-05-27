# Phase 1-4G Simulated UAT & Readiness Review

วันที่ตรวจ: 2026-05-27  
ผู้ตรวจเชิงเทคนิค: Codex simulated review  
ขอบเขต: Phase 1 ถึง Phase 4G

เอกสารนี้เป็นผลตรวจแบบ simulated UAT/readiness review จากโค้ด, เอกสาร,
automated tests, smoke checks, และ readiness checks ที่รันได้ใน workspace นี้
ไม่ใช่ clinical/business sign-off แทนคนใช้งานจริง

## สรุปภาพรวม

ผลรวม: พร้อมเข้าสู่ UAT จริงแบบมีเงื่อนไข

- Automated test suite ผ่าน `167/167`
- TypeScript check ผ่าน
- Frontend workflow smoke ผ่าน
- Storage config check ผ่านด้วย local storage default
- Production readiness check ไม่มี error แต่มี warning 6 รายการ
- Ops drill readiness check ไม่มี error แต่มี warning 13 รายการ
- ยังไม่ได้ทดสอบกับหมอ/เภสัช/IT/เจ้าของคลินิกจริง
- ยังไม่ได้ทดสอบ hardware จริง เช่น scanner, printer bridge, network printer
- ยังไม่ได้รัน strict production/ops checks ใน target environment

## Verification ที่ Codex ทำแล้ว

| Check | ผล | หมายเหตุ |
| --- | --- | --- |
| `npx tsc --noEmit` | ผ่าน | ตรวจ type-level integration |
| `npm test` | ผ่าน `167/167` | ครอบคลุม backend services, API tests, migration guards, readiness scripts |
| `npm run frontend:workflow-smoke` | ผ่าน | ตรวจ static frontend workflow coverage |
| `npm run storage:check` | ผ่าน | driver `local`, root `/tmp/emr-core-file-assets` |
| `npm run production:check` | ผ่านแบบ warning | 0 errors, 6 warnings |
| `npm run ops:check` | ผ่านแบบ warning | 0 errors, 13 warnings |

ไม่ได้รันในรอบนี้:

- `npm run api:smoke`: ต้องการ target-like database/API setup
- `npm run browser:workflow-smoke`: ต้องการ Chrome/browser runtime
- `npm run browser:api-workflow-smoke`: ต้องการ Chrome และ Docker/Postgres target-like flow
- `npm run db:test`: ต้องการ local `psql` หรือ Docker Postgres ที่เตรียมไว้

## Production Readiness Warnings

`npm run production:check` ไม่มี error แต่แจ้ง warning เหล่านี้:

- `DEPLOYMENT_PROFILE`: ต้องตั้ง `pilot` หรือ production profile ก่อน pilot
- `DATABASE_URL`: ต้องตั้ง database จริงสำหรับ API startup/smoke
- `API_TOKEN`: ต้องตั้ง bearer token สำหรับ non-local
- `AUTH_SESSION_SECRET`: ต้องตั้ง secret สำหรับ login session
- `AUTH_LOGIN_CODE`: ต้องตั้ง login code policy ก่อนเปิด `/api/auth/sessions`
- `FILE_STORAGE_DIR`: ต้องชี้ไป persistent private disk path

## Ops Drill Warnings

`npm run ops:check` ไม่มี error แต่ยังต้องบันทึกหลักฐานจริง:

- strict production readiness ผ่านใน target environment
- storage check ผ่านกับ target file storage
- API smoke ผ่านกับ target-like database/API
- frontend workflow smoke ผ่านก่อน go-live
- backup/restore drill เสร็จและมีหลักฐาน
- rollback drill เสร็จและมีหลักฐาน
- security incident tabletop เสร็จและมีหลักฐาน
- กำหนด owner สำหรับ monitoring, backup, incident, deployment
- บันทึกวัน drill และ go-live/pilot window

## Phase Review

| Phase | Simulated status | Codex ตรวจได้ | ต้องให้คนตรวจต่อ |
| --- | --- | --- | --- |
| Phase 1 EMR foundation | ผ่านเชิงเทคนิค | core EMR docs, patient/clinical records, role/workflow docs, tests | หมอยืนยันข้อมูลเวชระเบียนและ flow อ่านง่ายพอ |
| Phase 2 clinic workflow/identity | ผ่านเชิงเทคนิค | queue, appointment, SOAP, note, auth/session/identity docs/tests | หมอ/พยาบาลลอง workflow หน้าคลินิกจริง |
| Phase 3 billing/pharmacy/controlled drugs | ผ่านเชิงเทคนิค | billing, cashier, inventory, procurement, FEFO, controlled drug reports/tests | บัญชี/เภสัชยืนยันตัวเลข, stock, controlled-drug process |
| Phase 4A ops drill foundation | พร้อมทำ drill จริง | readiness scripts/runbooks/checklists | IT ต้องทำ backup/restore, rollback, incident tabletop จริง |
| Phase 4B printer bridge queue | ผ่านเชิง contract | queue/ack API, delivery status, runbook | IT ต้องต่อ bridge หรือ simulator จริง |
| Phase 4C GS1 parsing | ผ่านเชิง parser/API | GS1 fields and verification coverage | เภสัชต้อง scan barcode GS1 จริง |
| Phase 4D scanner UX | ผ่านเชิง frontend/static | focus/clear/detail display checks | ต้องลอง keyboard-wedge scanner จริงที่หน้าเคาน์เตอร์ |
| Phase 4E label templates | ผ่านเชิงระบบ | template API/render/frontend/docs/tests | เภสัชต้องยืนยัน layout label จริง |
| Phase 4F print recovery | ผ่านเชิงระบบ | fallback/retry API/frontend/docs/tests | ห้องยา/IT ต้องซ้อม printer-down recovery จริง |
| Phase 4G printer observability | ผ่านเชิงระบบ | health JSON/CSV/dashboard/tests | IT ต้องใช้ report ใน drill และยืนยัน metric เพียงพอ |

## ส่วนที่ต้องให้คนทำหลังทดสอบเสร็จ

### หมอ/พยาบาล

- เปิด patient record จริงและตรวจว่า Flags, Allergies, Conditions,
  Medications, Notes, Encounters อ่านง่ายและครบ
- ลอง appointment/check-in/start visit/SOAP/end encounter ตั้งแต่ต้นจนจบ
- ลองแก้ SOAP เดิม, finalize/sign clinical note และยืนยันภาษาบนหน้าจอ
- ยืนยันว่า queue board ใช้งานได้จริงในจังหวะคลินิก

### เภสัช/ห้องยา

- ลอง drug catalog, allergy/interaction warning, override reason
- ลองรับ stock, lot/expiry, location/bin, transfer, FEFO guard
- ลอง controlled-substance dispense พร้อม witness/re-auth
- ลอง controlled reconciliation close/approve separation
- ลอง scanner จริงกับ barcode ปกติและ GS1
- ลอง label template กับเครื่องพิมพ์จริง
- ลอง printer bridge queue, fallback, retry, และ health report

### บัญชี/แคชเชียร์

- ลองสร้าง invoice จาก encounter
- ลองรับ payment/refund/void
- ลอง receipt/tax invoice numbers
- ดาวน์โหลด billing CSV และยืนยัน field เพียงพอต่อการส่งบัญชี
- ตรวจ cashier reconciliation และ billing summary

### IT/Ops

- ตั้ง target env variables ทั้งหมด:
  `DEPLOYMENT_PROFILE`, `DATABASE_URL`, `API_TOKEN`,
  `AUTH_SESSION_SECRET`, `AUTH_LOGIN_CODE`, `FILE_STORAGE_DIR`
- รัน `PRODUCTION_READINESS_STRICT=true npm run production:check`
- รัน `npm run storage:check` กับ persistent/private storage จริง
- รัน `npm run api:smoke` กับ target-like database/API
- รัน browser smoke ถ้ามี Chrome/Docker พร้อม
- ทำ backup/restore drill จริง รวม database และ file assets
- ทำ rollback drill จริง
- ทำ security incident tabletop
- กำหนด monitoring/backup/incident/deployment owners
- บันทึก go-live หรือ pilot window

### เจ้าของคลินิก/ผู้ตัดสินใจ

- อ่าน Phase 1, Phase 2, Phase 3, Phase 4 closure summaries
- ตรวจรายการ human validation ด้านบนว่าผ่านแล้ว
- ตัดสิน pilot go/no-go
- ระบุ blocker ที่ต้องแก้ก่อน pilot ถ้ามี

## Go/No-Go Draft

สถานะจาก simulated review: Conditional Go for real UAT

เหตุผล:

- ไม่มี automated blocker จาก checks ที่รันได้ใน workspace
- โครงเอกสารและ runbook สำหรับ Phase 1-4G ครบพอสำหรับ UAT จริง
- ยังเหลือ validation ที่ต้องทำกับคนจริง, hardware จริง, และ target
  environment จริง

เงื่อนไขก่อน pilot:

1. ปิด production readiness warnings ใน target environment
2. ปิด ops drill warnings ด้วยหลักฐานจริง
3. ให้หมอ/พยาบาล/เภสัช/บัญชี/IT ทำ UAT sign-off
4. บันทึก go/no-go decision ในเอกสาร pilot decision

## Recommended Next Step

ทำ human UAT/drill จริงตาม checklist นี้เป็นลำดับ:

1. Clinical workflow UAT: Phase 1-2
2. Billing/pharmacy/controlled-drug UAT: Phase 3
3. Ops/hardware drill: Phase 4A-4G
4. Fix เฉพาะ blocker
5. ทำ pilot go/no-go
