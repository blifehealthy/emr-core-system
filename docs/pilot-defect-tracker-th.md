# Pilot Defect Tracker

ใช้บันทึก defect ระหว่าง UAT/pilot และ retest หลังแก้ไข

## Severity

| Severity | นิยาม |
| --- | --- |
| Blocker | ใช้ pilot ไม่ได้, ข้อมูลเสีย, หรือความเสี่ยงผู้ป่วย/การเงินสูง |
| High | workflow หลักใช้ไม่ได้หรือผิด แต่มี workaround ชั่วคราว |
| Medium | กระทบงานบางส่วน แต่ไม่หยุด pilot |
| Low | ข้อความ, layout, polish, หรือ improvement |

## Status

| Status | นิยาม |
| --- | --- |
| New | พบปัญหาใหม่ |
| Triaged | ประเมิน severity/owner แล้ว |
| In progress | กำลังแก้ |
| Ready for retest | แก้แล้ว รอผู้แจ้งทดสอบซ้ำ |
| Closed | retest ผ่าน |
| Deferred | ไม่แก้ก่อน pilot และมีผู้อนุมัติ |

## Tracker

| ID | Date | Reporter | Role | Area | Severity | Status | Summary | Steps to reproduce | Expected | Actual | Owner | Fix commit | Retest result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UAT-001 | | | | | | New | | | | | | | |

## Daily Triage Template

| Date | Open blockers | Open high | Closed today | Decision |
| --- | --- | --- | --- | --- |
| | | | | |

## Rules

- Blocker ต้องมี owner ภายในวันเดียวกัน
- High ต้องมี workaround หรือ fix plan ก่อน go/no-go
- Deferred ต้องมีผู้อนุมัติและเหตุผล
- Closed ต้องมีผู้แจ้งหรือ role owner ยืนยัน retest
