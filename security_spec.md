# Security Specification for Vastu Ritam Firestore Rules

## 1. Data Invariants
1. **Default Deny**: All paths not explicitly matched in `/databases/{database}/documents` are denied read and write access (`allow read, write: if false;`).
2. **Site Branding Read Access**: Only the specific singleton document `/site_settings/branding` may be read via `get` (`isValidId(settingId) && settingId == 'branding'`). Blanket `list` queries on `/site_settings` are strictly forbidden.
3. **Site Branding Write Access**: Creating or updating `/site_settings/branding` requires an authenticated and verified administrator (`isAdmin()`) and strict schema validation (`isValidSiteBranding(incoming())`).
4. **Immutable Fields**: `createdAt` on `/site_settings/branding` and `/admins/{adminId}` is immutable after creation (`incoming().createdAt == existing().createdAt`).
5. **Temporal Integrity**: `createdAt` on document creation and `updatedAt` on document updates must strictly equal `request.time`.
6. **Strict Key & Size Constraints**: Every string property enforces `minLength` and `maxLength` matching `firebase-blueprint.json`, and `hasOnly` / `hasAll` key checks block any undeclared shadow fields.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection**: `{ logoUrl: "/trademark-logo.jpg", fileName: "logo.jpg", mimeType: "image/jpeg", updatedBy: "uid1", createdAt: request.time, updatedAt: request.time, isSuperAdmin: true }` -> Blocked by `hasOnly()`.
2. **Unverified Admin Email Spoof**: Request with `auth.token.email == 'animeshsenams123@gmail.com'` but `auth.token.email_verified == false` -> Blocked by `request.auth.token.email_verified == true`.
3. **ID Poisoning Attack**: Attempt to write to `/site_settings/malicious_id_with_invalid_chars!@#` -> Blocked by `isValidId(settingId) && settingId == 'branding'`.
4. **Oversized Payload (Denial of Wallet)**: `logoUrl` string exceeding 950,000 characters -> Blocked by `data.logoUrl.size() <= 950000`.
5. **Type Confusion**: `{ logoUrl: 12345, fileName: true, ... }` -> Blocked by `data.logoUrl is string`.
6. **Timestamp Forgery on Create**: Setting `createdAt` to a past or future client timestamp instead of `request.time` -> Blocked by `incoming().createdAt == request.time`.
7. **Timestamp Forgery on Update**: Setting `updatedAt` to a forged timestamp instead of `request.time` -> Blocked by `incoming().updatedAt == request.time`.
8. **Immortal Field Mutation**: Modifying `createdAt` during an `update` on `/site_settings/branding` -> Blocked by `incoming().createdAt == existing().createdAt`.
9. **Identity Spoofing on Write**: Setting `updatedBy` to a UID different from `request.auth.uid` -> Blocked by `data.updatedBy == request.auth.uid`.
10. **Unauthorized Admin Self-Promotion**: Non-admin user attempting to create `/admins/{theirUid}` -> Blocked by `isAdmin()`.
11. **Collection Scraping via List**: Calling `list` on `/site_settings` or `/admins` -> Blocked because `allow list: if false;`.
12. **Arbitrary Delete**: Attempting to delete `/site_settings/branding` -> Blocked by `allow delete: if false;`.
