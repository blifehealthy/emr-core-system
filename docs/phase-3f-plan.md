# Phase 3F Plan

Phase 3F adds purchase order approval controls on top of the Phase 3E
procurement foundation.

## Scope

- Purchase order approval status tracking.
- Submit, approve, and reject APIs for purchase orders.
- Approval audit trail columns for submitted/approved/rejected user and time.
- Rejection reason capture.
- Purchase order receiving is blocked until the order is approved.
- Prescriptions tab purchase order cards show approval status and approval
  actions.

## Acceptance

- Users can submit draft or rejected purchase orders for approval.
- Admin users can approve pending purchase orders.
- Admin users can reject pending purchase orders with a reason.
- Approved draft purchase orders move to ordered status.
- Receiving a purchase order line before approval is rejected.
- API smoke covers submit, approve, and receiving after approval.

## Out Of Scope

- Configurable approval thresholds.
- Multi-approver routing.
- Department budgets.
- Supplier payment handoff.
- Multi-location inventory.
