# Phase 3N Plan: Inventory Transfer Workflow

## Goal

Make stock transfer between pharmacy locations safer for clinic operations by
supporting lot-specific transfer requests, approval, in-transit tracking, and
destination receiving.

## Scope

- Add `pending` and `in_transit` transfer states.
- Allow transfer requests to reference an inventory lot.
- Keep existing immediate transfer behavior for simple same-staff movements.
- Add approve, receive, and cancel actions for transfer workflow.
- Reflect workflow status and actions in the pharmacy inventory panel.
- Add smoke coverage and UAT-ready Thai documentation.

## Out Of Scope

- Controlled substance register.
- Budget approval workflow.
- External notification or printer bridge integration.
- Lot splitting UX beyond recording the selected source lot.

## Acceptance Criteria

- A staff member can create an immediate transfer as before.
- A staff member can create an approval-required transfer and see it as
  `pending`.
- Approving a pending transfer deducts source location stock and marks it
  `in_transit`.
- Receiving an in-transit transfer adds destination location stock and marks it
  `completed`.
- Cancelling pending or in-transit transfers records cancellation metadata; an
  in-transit cancellation restores source location stock.
- API smoke verifies create, approve, receive, and list behavior.
