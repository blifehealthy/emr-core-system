# Pilot Known Limitations And Deferred Scope

เอกสารนี้ใช้บอกคนทดสอบและเจ้าของคลินิกว่าอะไรยังเป็นข้อจำกัด,
อะไรเป็น workaround, และอะไรยังไม่ควรถือว่าเป็น blocker ถ้าตกลง defer แล้ว

## หลักการ

- ข้อจำกัดที่กระทบความปลอดภัยผู้ป่วย, เงิน, stock, หรือ privacy ต้องไม่ defer
  โดยไม่มี owner อนุมัติ
- Workaround ต้องเขียนชัดว่าใครทำ เมื่อไร และบันทึกหลักฐานตรงไหน
- ถ้าข้อจำกัดทำให้ pilot ใช้จริงไม่ได้ ให้บันทึกเป็น blocker

## Known Limitations

| Area | Limitation | Workaround | Pilot risk | Owner decision |
| --- | --- | --- | --- | --- |
| Hardware printer | ยังไม่มี vendor-specific driver ใน repo | ใช้ browser/manual fallback หรือ bridge adapter ภายนอก | Medium | |
| Scanner hardware | Codex ทดสอบได้แค่ static/simulated ไม่ใช่เครื่องจริง | ทดสอบ keyboard-wedge scanner ใน UAT จริง | Medium | |
| Target deployment | Local checks ไม่แทน target environment | รัน strict readiness และ smoke ใน target | High | |
| External identity provider | มี OIDC/JWKS foundation แต่ต้อง config provider จริง | ใช้ pilot auth หรือ configure provider ก่อน pilot | High | |
| File storage | Local default เป็น `/tmp` สำหรับ dev | ตั้ง persistent private path ก่อน pilot | High | |
| Accounting integration | ยังไม่มี export เข้าระบบบัญชีภายนอกโดยตรง | ใช้ billing CSV | Medium | |
| Insurance/payer integration | ยังไม่มี payer claim export integration จริง | ใช้ claim lifecycle/manual export | Medium | |
| Lab integration | ยังไม่อยู่ใน scope | บันทึกผล lab นอกระบบหรือแนบไฟล์ตาม policy | Low/Medium | |
| Patient communication | ยังไม่มี LINE/SMS reminder | ใช้ workflow manual | Low/Medium | |
| Telemedicine | ยังไม่อยู่ใน scope | ใช้ external telemedicine process | Low | |

## Not Accepted As Deferred Without Owner Approval

- patient record เปิดผิดคน
- allergy/interaction warning ไม่ทำงานใน scenario สำคัญ
- controlled drug witness/re-auth ไม่ enforce
- stock movement ทำให้ quantity ผิด
- invoice/payment/refund total ผิด
- audit log action สำคัญไม่บันทึก
- production secrets หรือ token ใช้ค่า default/weak
- backup/restore ใช้งานไม่ได้

## Manual Workaround Rules

Clinical:

- ใช้แบบฟอร์มกระดาษชั่วคราว
- backfill เข้าระบบเมื่อกลับมา
- ต้องมีผู้รับผิดชอบตรวจความครบถ้วน

Pharmacy:

- จ่ายยาตาม SOP manual ของเภสัช
- บันทึก lot/quantity ที่จ่าย
- ทำ stock correction หลังระบบกลับมา

Billing:

- ออกใบรับเงิน manual ตาม policy
- reconcile กับ invoice ในระบบหลังกลับมา
- เก็บเลขเอกสาร manual เพื่อกันซ้ำ

Printer/scanner:

- ใช้ manual barcode entry
- ใช้ browser fallback/manual print
- บันทึก fallback reason ทุกครั้ง

## Deferred Scope Candidate For Phase 5

- vendor-specific printer bridge packaging
- external accounting export
- payer/insurance claim file export
- appointment reminder via LINE/SMS
- consent-aware patient messaging
- lab order/result module
- analytics/trend dashboards
- deeper PDPA retention/anonymization tooling
