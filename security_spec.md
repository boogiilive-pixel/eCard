# Security Specification for eCard B2B

## Data Invariants
1. A user profile linked to a company (`company_id`) must have a corresponding `CompanyMember` record in that company's subcollection.
2. Only Company Admins can add or remove members (employees).
3. Only Company Admins can place B2B orders.
4. Employees can see their own company's public info but not other company private data.
5. Company IDs, Member IDs, and Order IDs must follow the standard ID pattern (`^[a-zA-Z0-9_\\-]+$`).

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Attempt to create a profile with `is_company_admin: true` by a non-admin.
2. **Resource Poisoning**: Use a 1MB string as a company name.
3. **Relational Bypass**: Read `orders` or `members` of a company the user doesn't belong to.
4. **Member Escalation**: An employee attempting to update their role to `admin` in `CompanyMember`.
5. **Orphaned Write**: Create a `CompanyMember` record for a non-existent company.
6. **Cross-Company Access**: Update a profile's `company_id` to a company the user isn't invited to.
7. **Terminal State Bypass**: Update an order status from `completed` back to `pending`.
8. **Shadow Field Injection**: Add `internal_notes: "..."` to an order.
9. **Fake ID Attack**: Use `../../../etc/passwd` as a company ID.
10. **Unverified Order**: Place an order without `request.auth.token.email_verified == true`.
11. **PII Leak**: Non-member attempting to list the full member list (with emails) of a company.
12. **Immutable Field Attack**: Attempt to change `company_id` once set.

## Red Team Audit Results (Anticipated)
- Pass: All identity-based queries are enforced at the rule level (`resource.data.company_id == ...`).
- Pass: Write operations are guarded by `affectedKeys().hasOnly()`.
- Pass: Size limits are enforced on all strings.
