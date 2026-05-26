# Phase 3H Clinician Summary

Phase 3H เพิ่มฐาน barcode verification สำหรับห้องยา โดยเริ่มจากการรับของและ
การจ่ายยา

## สิ่งที่เพิ่ม

- inventory item เก็บ barcode ได้
- lot เก็บ lot barcode, scanned barcode, และสถานะ verified ได้
- รับ stock เข้า lot โดยใส่ barcode ที่ scan ได้
- รับของจาก PO โดยใส่ barcode ที่ scan ได้
- จ่ายยาจาก prescription โดยใส่ barcode ที่ scan ได้
- ระบบมี API สำหรับบันทึกการ scan barcode และคืนผลว่า match item/lot หรือไม่
- หน้า Prescriptions เพิ่มช่อง barcode ใน workflow ห้องยา

## ประโยชน์ในการใช้งาน

- ลดความเสี่ยงหยิบยาผิด item หรือผิด lot
- เริ่มเก็บหลักฐานว่าเคย scan barcode ก่อนรับของหรือจ่ายยา
- เตรียมต่อยอดเป็น scanner จริงและ label printing ในเฟสถัดไป
- ยังไม่บังคับ workflow เดิมทั้งหมด เพราะ barcode verification เปิดใช้แบบ
  optional ได้ก่อน

## ข้อจำกัดตอนนี้

- ยังไม่อ่าน barcode format เฉพาะทาง เช่น GS1
- ยังไม่พิมพ์ฉลาก barcode
- ยังไม่ผูก location/bin ของคลัง
- ยังไม่ทำ controlled-substance register
