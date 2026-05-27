# UAT Tester Delivery Pack

ชุดเอกสารนี้ใช้ส่งให้คนทดสอบ UAT/pilot เพื่อให้ทดสอบได้เป็นลำดับเดียวกัน
และบันทึกผลกลับมาได้ง่าย

## เอกสารสำหรับส่งให้ทีมทดสอบ

| เอกสาร | ใช้กับใคร | ใช้ทำอะไร |
| --- | --- | --- |
| `docs/uat-role-quick-guides-th.md` | หมอ, พยาบาล, เภสัช, แคชเชียร์, Admin, IT | คู่มือ 1 หน้าแยกตาม role |
| `docs/uat-test-data-plan-th.md` | UAT lead, Admin, IT, เภสัช, บัญชี | เตรียมข้อมูลทดสอบให้ครบทุก workflow |
| `docs/uat-step-by-step-scripts-th.md` | คนทดสอบทุก role | ทำตาม script ทีละขั้นตอนพร้อม expected result |
| `docs/pilot-launch-checklist-th.md` | Owner, UAT lead, IT/Ops | ตรวจวันก่อน pilot, วัน pilot, หลัง pilot วันแรก |
| `docs/pilot-known-limitations-th.md` | Owner, UAT lead, คนทดสอบทุก role | รู้ข้อจำกัดและ workaround ก่อนทดสอบ |
| `docs/uat-execution-checklist-th.md` | UAT lead | Checklist รวมสำหรับ sign-off |
| `docs/pilot-defect-tracker-th.md` | UAT lead, ทุก role | บันทึก defect/blocker |
| `docs/pilot-go-no-go-template-th.md` | Owner | ตัดสิน go/no-go หลัง UAT |

## PDF Output

PDF จะถูกสร้างไว้ใน `docs/pdf/` ด้วยชื่อเดียวกับเอกสาร Markdown

## วิธีแนะนำให้ใช้

1. ส่ง `uat-role-quick-guides-th.pdf` ให้ทุกคนอ่านก่อน
2. ให้ UAT lead ใช้ `uat-test-data-plan-th.pdf` เตรียมข้อมูล
3. วันทดสอบให้เปิด `uat-step-by-step-scripts-th.pdf`
4. บันทึกผลรวมใน `uat-execution-checklist-th.pdf`
5. บันทึก defect ใน `pilot-defect-tracker-th.pdf`
6. ก่อนเริ่ม pilot ใช้ `pilot-launch-checklist-th.pdf`
7. หลัง UAT ใช้ `pilot-go-no-go-template-th.pdf`
