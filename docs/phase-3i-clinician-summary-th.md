# Phase 3I Clinician Summary

Phase 3I เพิ่มหน้าจอ scan barcode และการพิมพ์ label สำหรับห้องยา

## สิ่งที่เพิ่ม

- แผง Pharmacy inventory มีช่อง scan barcode
- scan แล้วระบบบันทึก audit และแจ้งว่า match item/lot หรือไม่
- inventory item card มีปุ่มพิมพ์ label
- inventory lot card มีปุ่มพิมพ์ lot label
- มีปุ่มพิมพ์ labels ทั้งหมดจาก item/lot ที่โหลดอยู่
- label print แสดงชื่อ item, lot, barcode text, และข้อมูลจำเป็นสำหรับห้องยา

## ประโยชน์ในการใช้งาน

- ห้องยาเริ่มใช้ barcode scanner แบบ keyboard input ได้
- พิมพ์ label พื้นฐานสำหรับติด item/lot ได้จากหน้าระบบ
- ลดการจด barcode แยกนอกระบบ
- ต่อจาก Phase 3H เพื่อให้ verified receiving/dispensing ใช้งานง่ายขึ้น

## ข้อจำกัดตอนนี้

- ยังไม่ export ZPL/ESC/POS สำหรับ printer เฉพาะทาง
- ยังไม่อ่าน GS1 barcode
- ยังไม่มี print job queue
- ยังไม่มี label สำหรับ location/bin
