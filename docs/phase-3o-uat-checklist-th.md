# Phase 3O UAT Checklist: FEFO และ Expiry Guard

## เตรียมข้อมูล

- มี inventory item อย่างน้อย 1 รายการ
- มี lot อย่างน้อย 2 lot ของ item เดียวกัน
- lot แรกหมดอายุก่อนและมี stock เพียงพอ
- lot ที่สองหมดอายุช้ากว่า
- มี location/bin ที่ใช้จ่ายยาและย้าย stock

## กรณีทดสอบ

- เลือก lot ที่หมดอายุก่อน แล้วจ่ายยาได้ตามปกติ
- เลือก lot ที่หมดอายุช้ากว่า โดยไม่กรอก `fefoOverrideReason`
- ตรวจว่าระบบแจ้ง error และไม่ตัด stock
- เลือก lot ที่หมดอายุช้ากว่าอีกครั้ง พร้อมกรอก `fefoOverrideReason`
- ตรวจว่าจ่ายยาได้ และ dispense row เก็บเหตุผล override
- เลือก lot ที่หมดอายุแล้ว โดยไม่กรอก `expiryOverrideReason`
- ตรวจว่าระบบแจ้ง error และไม่ตัด stock
- เลือก lot ที่หมดอายุแล้ว พร้อมกรอก `expiryOverrideReason`
- ตรวจว่าระบบยอมให้ทำงานและบันทึกเหตุผล
- ทดสอบการสร้าง transfer ด้วย lot ที่ไม่ใช่ FEFO และ expired lot ด้วยเงื่อนไขเดียวกัน

## API ที่เกี่ยวข้อง

- `POST /api/prescriptions/:prescriptionId/dispenses`
- `POST /api/inventory-transfers`

## เกณฑ์ผ่าน

- ระบบไม่ตัด stock เมื่อไม่มีเหตุผล override ที่จำเป็น
- ระบบเก็บ `expiry_override_reason`, `fefo_override_reason`, และ `fefo_recommended_lot_id`
- เจ้าหน้าที่เข้าใจความต่างระหว่าง expiry override และ FEFO override
