# Phase 3O Plan: FEFO And Expiry Picking Guard

## Goal

Reduce pharmacy dispensing and stock transfer errors by enforcing expiry and
FEFO picking rules when a user selects an inventory lot.

## Scope

- Block expired lot dispensing or transfer unless an expiry override reason is
  recorded.
- Block selecting a later-expiring lot when an earlier non-expired lot has
  sufficient stock unless a FEFO override reason is recorded.
- Store override reasons and the recommended FEFO lot for audit review.
- Apply the guard to prescription dispensing and inventory transfer creation.
- Surface override fields in the pharmacy panel and smoke coverage.

## Out Of Scope

- Controlled substance register.
- Lot splitting automation.
- Role-specific approval for override reasons.
- Notification workflow for override review.

## Acceptance Criteria

- Dispensing an expired selected lot fails without `expiryOverrideReason`.
- Dispensing a non-FEFO selected lot fails without `fefoOverrideReason`.
- Transfer creation uses the same expiry and FEFO guard for selected lots.
- Successful overrides are returned in API DTOs and visible in auditable rows.
- API smoke and unit tests cover the new guard.
