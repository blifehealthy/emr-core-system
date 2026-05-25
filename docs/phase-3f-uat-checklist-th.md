# Phase 3F UAT Checklist

## Approval Workflow

- [ ] สร้าง PO แล้ว approval status เริ่มที่ `draft`
- [ ] ส่ง PO เพื่ออนุมัติแล้ว status เป็น `pending_approval`
- [ ] อนุมัติ PO แล้ว approval status เป็น `approved`
- [ ] อนุมัติ PO แล้ว PO status เป็น `ordered`
- [ ] ไม่อนุมัติ PO แล้ว approval status เป็น `rejected`
- [ ] rejection reason แสดง/ตรวจสอบได้

## Receiving Control

- [ ] รับของจาก PO ที่ยังไม่ approved ไม่ได้
- [ ] รับของจาก PO ที่ approved ได้
- [ ] รับของแล้ว stock, lot, และ stock movement ถูกต้อง

## Frontend

- [ ] PO card แสดง approval status
- [ ] PO draft/rejected มีปุ่มส่งอนุมัติ
- [ ] PO pending มีปุ่มอนุมัติและไม่อนุมัติ
- [ ] PO approved มีปุ่มรับของจาก PO
- [ ] หลัง action แล้วหน้า refresh และสถานะถูกต้อง

## Sign-off

- [ ] ห้องยายืนยันขั้นตอนขออนุมัติก่อนรับของใช้งานได้
- [ ] ผู้จัดการ/เจ้าของคลินิกยืนยันว่า single-approver เพียงพอสำหรับรอบนี้
