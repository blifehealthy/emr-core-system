# Phase 4F Closure Summary

Phase 4F ปิดก้อน degraded-mode barcode print recovery แล้ว

## ทำอะไรเพิ่ม

- เพิ่ม migration `0048_add_phase_4f_print_fallback_recovery`
- เพิ่มคอลัมน์ fallback/retry metadata บน `inventory_barcode_print_jobs`
- เพิ่ม API:
  - `PATCH /api/inventory-barcode-print-jobs/:jobId/fallback`
  - `PATCH /api/inventory-barcode-print-jobs/:jobId/retry`
- list print jobs รองรับ `fallbackStatus`
- frontend เพิ่ม Print recovery panel
- เพิ่ม docs/runbook/UAT และ tests

## ผลกับงานห้องยา

- ถ้า bridge/network printer ล่ม เจ้าหน้าที่เปิด payload เพื่อ print ผ่าน browser ได้
- ถ้าพิมพ์ manual แล้ว สามารถ mark เหตุผลไว้ใน audit trail
- เมื่อเครื่องกลับมา สามารถ retry งานกลับเข้า queue ได้

## Verification

- `node --check frontend/app.js` ผ่าน
- `npm run frontend:workflow-smoke` ผ่าน
- `npx tsc --noEmit` ผ่าน
- targeted Phase 4F tests ผ่าน
- `npm test` ผ่าน `166/166`
