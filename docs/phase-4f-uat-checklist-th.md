# Phase 4F UAT Checklist

## เตรียมข้อมูล

- [ ] มี printer profile แบบ `utility_bridge` หรือ `network`
- [ ] มี barcode print job อย่างน้อย 1 รายการ
- [ ] จำลองงานพิมพ์ failed ด้วย delivery acknowledgement

## ทดสอบ fallback

- [ ] เปิดหน้า Pharmacy inventory แล้วเห็น Print recovery
- [ ] งาน failed แสดง error และจำนวน attempt
- [ ] กด Browser fallback แล้วเปิด payload สำหรับพิมพ์ผ่าน browser ได้
- [ ] ระบบบันทึก `fallback_status = browser_export`
- [ ] กด Manual printed แล้วระบบบันทึก `fallback_status = manual_print`
- [ ] ถ้าไม่กรอกเหตุผล fallback API ต้องตอบ 400

## ทดสอบ retry

- [ ] กด Retry queue หลัง bridge กลับมา
- [ ] งาน bridge/network กลับเป็น `queued`
- [ ] ระบบล้าง `last_delivery_error`
- [ ] ระบบบันทึกผู้กด retry และเวลา

## เกณฑ์ผ่าน

- [ ] ห้องยายืนยันว่าไม่ต้องสร้าง label ซ้ำเองเมื่อเครื่องพิมพ์ล่ม
- [ ] IT ยืนยันว่ามี audit ว่าใคร fallback/retry และเพราะอะไร
- [ ] ยังสามารถใช้ Phase 4B queue/ack flow ได้หลัง retry
