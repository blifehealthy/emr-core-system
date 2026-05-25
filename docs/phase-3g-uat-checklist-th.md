# Phase 3G UAT Checklist

## Approval Policy

- [ ] สร้าง approval policy ได้
- [ ] policy แสดง min/max total, sequence, required role ถูกต้อง
- [ ] สร้าง policy หลายลำดับสำหรับ threshold เดียวกันได้

## Multi-Step Approval

- [ ] ส่ง PO แล้วระบบสร้าง approval steps ตาม policy
- [ ] อนุมัติ step แรกแล้ว PO ยังเป็น `pending_approval` ถ้ายังมี step ค้าง
- [ ] อนุมัติครบทุก step แล้ว PO เป็น `approved`
- [ ] เมื่อ approved แล้ว PO status เป็น `ordered`
- [ ] reject step แล้ว PO เป็น `rejected`
- [ ] rejection reason ถูกบันทึก

## Receiving Control

- [ ] รับของจาก PO ที่ยังอนุมัติไม่ครบไม่ได้
- [ ] รับของจาก PO ที่อนุมัติครบแล้วได้
- [ ] รับของแล้ว lot, stock, และ stock movement ถูกต้อง

## Frontend

- [ ] แผง Pharmacy inventory แสดงจำนวน approval policies
- [ ] เพิ่ม approval policy จากหน้า Prescriptions ได้
- [ ] PO card แสดง approval steps และสถานะแต่ละ step
- [ ] ปุ่ม approve/reject ทำงานกับ step ที่ pending ถัดไป

## Sign-off

- [ ] ผู้จัดการห้องยายืนยัน threshold และ sequence ใช้งานได้
- [ ] เจ้าของคลินิกยืนยัน flow นี้เพียงพอก่อนเพิ่ม budget/notification
