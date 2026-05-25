# Phase 3D UAT Checklist

## Receiving

- [ ] รับยาเข้าคลังโดยเลือก inventory item ได้
- [ ] บันทึก lot number ได้
- [ ] บันทึกวันหมดอายุได้
- [ ] บันทึก supplier ได้
- [ ] บันทึก reference number ได้
- [ ] stock รวมของ inventory item เพิ่มตามจำนวนที่รับเข้า
- [ ] stock movement มีรายการรับเข้าและผูกกับ lot

## Lot Visibility

- [ ] หน้า Prescriptions แสดงจำนวน lot
- [ ] หน้า Prescriptions แสดงจำนวน lot ที่ใกล้หมดอายุ
- [ ] list lot แสดง lot number, วันหมดอายุ, quantity, supplier
- [ ] API list lot filter ตาม inventory item ได้

## Dispense

- [ ] จ่ายยาจาก prescription โดยระบุ lot ได้
- [ ] หลังจ่ายยา stock รวมลดลง
- [ ] หลังจ่ายยา stock ของ lot ลดลง
- [ ] dispense record มี inventory lot id
- [ ] stock movement dispense มี inventory lot id
- [ ] ระบบไม่อนุญาตให้จ่ายเกิน stock ของ lot

## Audit And Safety

- [ ] receiving สร้าง audit log
- [ ] dispense ยังสร้าง audit log
- [ ] duplicate lot number ของ item เดียวกันถูกป้องกัน
- [ ] lot ที่หมด stock สามารถยังถูกดูย้อนหลังได้เมื่อ include empty
