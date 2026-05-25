# Phase 3G Plan

Phase 3G extends Phase 3F purchase order approvals with threshold-based
approval policies and multi-approver routing.

## Scope

- Clinic-managed purchase order approval policies.
- Policy matching by purchase order total amount.
- Approval sequence and required role per policy step.
- Purchase order approval steps generated when a PO is submitted.
- Approve/reject APIs act on the next pending step or an explicit step.
- Purchase order is approved only after every required step is approved.
- Receiving stays blocked until all approval steps are approved.
- Prescriptions tab shows approval policy setup and per-PO approval progress.

## Acceptance

- Users can create and list active approval policies.
- Submitting a PO generates approval steps from matching threshold policies.
- If no policy matches, the system creates a default admin approval step.
- Approving one step keeps the PO pending when more steps remain.
- Approving all steps marks the PO approved and ordered.
- Rejecting any pending step marks the PO rejected and captures a reason.
- API smoke covers policy creation, two-step approval, and receiving after full
  approval.

## Out Of Scope

- Department budgets.
- Parallel approver groups.
- External approval notification integration.
- Supplier payment/accounting handoff.
- Multi-location inventory.
