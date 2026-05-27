# Phase 4D UAT Checklist: Scanner UX Hardening

## เตรียมอุปกรณ์

- [ ] มี scanner ที่ตั้งเป็น keyboard wedge
- [ ] scanner ส่ง Enter หลัง scan
- [ ] มี barcode item/lot และ GS1 ตัวอย่าง

## Scanner Panel

- [ ] ช่อง scan ได้ focus อัตโนมัติ
- [ ] scan แล้วระบบ submit ได้โดยไม่ต้องกดปุ่ม
- [ ] หลัง scan สำเร็จ ช่อง scan ถูก clear ถ้าเปิด `Clear after scan`
- [ ] หลัง scan สำเร็จ focus กลับมาที่ช่อง scan ถ้าเปิด `Keep focus`
- [ ] ปิด `Clear after scan` แล้ว barcode ยังอยู่ในช่องเพื่อ debug ได้
- [ ] ผล scan แสดง item/lot ที่ match
- [ ] ผล scan แสดง GTIN/lot/expiry/serial เมื่อเป็น GS1

## Sign-Off

- [ ] ห้องยายืนยันว่ายิงต่อเนื่องได้
- [ ] ทีม IT บันทึก scanner model และ mode ที่ใช้จริง
- [ ] ตัวอย่าง barcode ที่ผิดรูปแบบถูกเก็บไว้เพื่อทำงานต่อ
