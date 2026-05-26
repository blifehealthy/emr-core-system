# Phase 3Q Plan: Pharmacy Role Separation

## Goal

Reduce high-risk pharmacy actions by separating FEFO/expiry override permission
and inventory transfer action permissions from generic pharmacy catalog writes.

## Scope

- Add `pharmacy_override_write` for dispense or transfer payloads that include
  `expiryOverrideReason` or `fefoOverrideReason`.
- Add dedicated transfer permissions:
  - `inventory_transfer_approve`
  - `inventory_transfer_receive`
  - `inventory_transfer_cancel`
- Keep transfer receiving available to nurse/admin roles so pharmacy staff can
  complete physical receipt after admin approval.
- Add API regression coverage for normal dispense, override dispense, and
  separated transfer action permissions.
- Update API and role-permission documentation.

## Out Of Scope

- Database-backed custom role permissions.
- Multi-person override approval workflow.
- Notification routing.
- Controlled-substance register.

## Acceptance Criteria

- Doctor/admin can dispense normally through `prescription_write`.
- Only admin can dispense with FEFO/expiry override reason.
- Only admin can approve or cancel inventory transfers.
- Nurse/admin can receive in-transit inventory transfers.
- Permission matrix and UAT docs clearly identify the new boundaries.
