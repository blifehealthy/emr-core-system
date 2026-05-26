# สรุป Phase 3L สำหรับทีมคลินิก: Location/Bin ของคลังยา

Phase 3L เพิ่มฐานสำหรับแยกคลังยาเป็นหลายจุด เช่น ห้องยาใหญ่ จุดจ่ายยา สาขา หรือ bin/ชั้นวาง

## สิ่งที่เพิ่ม

- สร้าง inventory location ได้ในหน้า Pharmacy inventory
- ตั้ง location หลักเป็น default ได้
- รับเข้า lot พร้อมระบุ location และ bin
- ปรับ stock พร้อมระบุ location/bin ได้
- จ่ายยาพร้อมระบุ location ได้
- ประวัติ stock movement เห็น location ที่เกี่ยวข้อง

## ประโยชน์

- ทีมยาเริ่มเห็นว่ายาอยู่จุดไหน
- ตรวจสอบย้อนหลังได้ว่ารับเข้า/จ่ายออกจาก location ใด
- เปิดทางต่อยอด transfer ระหว่าง location และ reorder ต่อ location

## หมายเหตุ

เฟสนี้ยังคงเก็บยอดรวมของ inventory item เหมือนเดิม และเพิ่ม location ให้กับ lot/dispense/movement ก่อน ยังไม่ใช่ ledger แยกยอดคงเหลือต่อ location แบบเต็มรูปแบบ
