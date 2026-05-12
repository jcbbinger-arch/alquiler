# Security Specification for Historical Inquilinos

## 1. Data Invariants
- A Tenant must have an `ownerId` matching the authenticated user's UID.
- A Payment must have an `ownerId` matching the authenticated user's UID and a `tenantId` that corresponds to a valid Tenant document owned by that user.
- Timestamps like `leaseStartDate` must be valid date strings.
- Monetary values must be numbers >= 0.

## 2. The Dirty Dozen Payloads (Targeting Rejection)
1. **Unauthorized Create**: Creating a tenant with someone else's `ownerId`.
2. **Unauthorized Read**: Reading a tenant document where the user is not the owner.
3. **Unauthorized Update**: Changing the `ownerId` of an existing tenant.
4. **Invalid ID**: Creating a tenant with a 2KB junk string as ID.
5. **Type Poisoning**: Sending a string for `deposit` instead of a number.
6. **Shadow Update**: Adding a `isVerified: true` field to a tenant during update.
7. **Orphaned Payment**: Creating a payment for a non-existent tenant (though partial enforcement via `ownerId` is primary).
8. **Impersonation Read**: Listing all tenants without filtering by `ownerId`.
9. **Update Gap**: Modifying `leaseStartDate` after creation if we wanted it immutable (let's keep it mutable but valid).
10. **Negative Values**: Setting `rentAmount` to -500.
11. **Future Timestamp Spoofing**: Setting `paymentDate` to a future date beyond current `request.time` (if strictly enforced).
12. **Missing Required Fields**: Creating a payment without `month` or `year`.

## 3. Test Runner (Mock Logic)
Expect `PERMISSION_DENIED` for all above cases.
