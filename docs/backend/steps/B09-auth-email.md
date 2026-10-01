# B09 — Auth + email core
**Risk:** H · **Needs:** B08 · **Agent:** Claude recommended · **User setup before QA:** USER-SETUP §3 (Turnstile), §4 (Resend) — optional in dev

## Goal
Secure sessions, email OTP sign-in (customers and admins), guards + permissions, Turnstile, and the email sender with the branded layout. No page uses it yet; B11 (admin login) and B19 (account) mount the form.

## Read first (only these)
- `docs/backend/RULES.md` §2
- `docs/backend/ARCHITECTURE.md` §6, §9, §12
- `docs/backend/NEXT16.md` → "Server Actions", "after()"
- `docs/backend/DATA-MODEL.md` §C (users, sessions, otp_codes)
- `src/server/env.ts`, `ids.ts`, `request.ts`, `rate-limit.ts`, `result.ts`, `log.ts`, `audit.ts`
- `src/lib/domain/permissions.ts`, `src/lib/domain/enums.ts`, `src/lib/domain/errors.ts`
- `src/i18n/navigation.ts`, `src/components/ui/Field.tsx`, `src/components/ui/Button.tsx`
- `messages/en.json` → `common` namespace (tone of voice only)

## Install
```
pnpm add @react-email/components@^1.0.12
```

## Files
Create: `src/lib/validation/auth.ts`, `src/server/auth/session.ts`, `src/server/auth/otp.ts`, `src/server/auth/turnstile.ts`, `src/server/auth/claims.ts`, `src/server/auth/guards.ts`, `src/server/auth/actions.ts`, `src/server/email/send.ts`, `src/server/email/components.tsx`, `src/server/email/templates/OtpEmail.tsx`, `src/components/auth/TurnstileWidget.tsx`, `src/components/auth/OtpForm.tsx`
Modify: `messages/en.json`, `messages/hi.json` (new namespaces `errors`, `auth`)

## Tasks
- [x] T1. `src/lib/validation/auth.ts`: `otpRequestSchema` `{ email: z.email().max(120) → trimmed lower-case, purpose: z.enum(OTP_PURPOSES), turnstileToken: z.string().max(2048).optional(), locale: z.enum(LOCALES) }`; `otpVerifySchema` `{ email, purpose, code: /^\d{6}$/, next: z.string().max(200).optional() }`. — antigravity
- [x] T2. `src/server/auth/session.ts`: `SESSION_MAX_AGE = { customer: 30 days, admin: 7 days }` (seconds); `cookieName(kind)` (`__Host-mka_c` / `__Host-mka_a` in production, `mka_c` / `mka_a` otherwise); `createSession(userId, kind)` (token = `randomToken()`, row id = `sha256Hex(token)`, `expiresAt`, ip, user agent; cookie `httpOnly`, `secure` in production, `sameSite: "lax"`, `path: "/"`, `maxAge`); `readSession(kind): Promise<{ sessionId: string; user: UserRow } | null>` (one join query; null when missing, expired, user not active, or — for admin — role not in `ADMIN_ROLES`; never sets cookies); `endSession(kind)` (delete row + cookie); `revokeUserSessions(userId)`. — antigravity
- [x] T3. `src/server/auth/otp.ts` per ARCH §6: `OTP_TTL_MS = 600000`, `OTP_MAX_ATTEMPTS = 5`; `issueOtp({ email, purpose, ip }): Promise<string | null>` (null for `admin_login` without an active admin with that email; consumes older open codes; stores `hmacHex(email + ":" + code)`); `verifyOtp({ email, purpose, code }): Promise<void>` (newest open code; expired/missing → `OTP_EXPIRED`; atomic `attempts + 1 … returning`; > 5 → consume + `OTP_EXPIRED`; mismatch via `safeEqualHex` → `OTP_INVALID`; success → consume). — antigravity
- [x] T4. `src/server/auth/turnstile.ts`: `verifyTurnstile(token: string | undefined, ip: string): Promise<void>` — not configured: development returns, production throws `NOT_CONFIGURED`; else POST form-encoded `secret`, `response`, `remoteip` to `https://challenges.cloudflare.com/turnstile/v0/siteverify` (8 s timeout); `success !== true` → `BOT_CHECK_FAILED`. — antigravity
- [x] T5. `src/server/auth/claims.ts`: `attachGuestRecords(userId: number, email: string): Promise<void>` — one `db.batch` updating `orders`, `bookings`, `kundali_orders` rows with that email and `user_id IS NULL`. — antigravity
- [x] T6. `src/server/auth/guards.ts` per ARCH §6: `SessionUser`, `AdminUser` types; `getCustomer`, `getAdmin` (React `cache`); `requireCustomer`, `requireAdmin(perm)` (uses `can()`); `requireCustomerPage(locale, path)` (locale-aware `redirect` from `@/i18n/navigation` to `/account?next=…`); `requireAdminPage(perm)` (`redirect("/admin/login")`, missing permission → `redirect("/admin?denied=1")`). — antigravity
- [x] T7. `src/server/email/send.ts`: `sendEmail({ to, subject, react, replyTo?, attachments?, devNote? }): Promise<void>` exactly as ARCH §9 (`render` from `@react-email/components`; Resend REST; 8 s timeout; non-2xx → throw `Error("resend <status>")`). — antigravity
- [x] T8. `src/server/email/components.tsx`: `EmailShell({ preview, locale, contact, children })` (emerald `#164E3F` header with the "Maa Kali Astuti" wordmark in `#D9B96A` serif, ivory `#FBF7EE` background, cream `#FFFDF8` card, ink `#1F2A24` text, gold `#B8923A` hairline, footer with `contact.phoneDisplay` + `contact.email`), `EmailButton`, `EmailText`, `EmailMuted`. Inline styles only (email clients). Hex values are the theme tokens. — antigravity
- [x] T9. `src/server/email/templates/OtpEmail.tsx`: props `{ code, locale, purpose, contact }`; EN/HI dictionary inside; subject helper `otpSubject(locale)`; says the code expires in 10 minutes and to ignore the mail if not requested. — antigravity
- [x] T10. `src/server/auth/actions.ts` (`"use server"`): `requestOtpAction`, `verifyOtpAction`, `logoutAction(kind)` exactly per ARCH §6. Customer verify: upsert user by email (`emailVerifiedAt`, `lastLoginAt`), `attachGuestRecords`, `createSession("customer")`, return `{ next }` where `next` must start with `/`, not `//`, not `/admin` (default `/account`). Admin verify: active admin user → `createSession("admin")`, `lastLoginAt`, `audit("auth.login")`, `{ next: "/admin" }`. OTP email is awaited; contact details from `getSetting("contact")`. — antigravity
- [x] T11. `src/components/auth/TurnstileWidget.tsx` (client): props `{ onToken(token: string | null): void; action: string; resetKey?: number }`; loads `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` once; renders explicitly (`appearance: "interaction-only"`, `size: "flexible"`, `theme: "light"`); expired/error → `onToken(null)`; `resetKey` change → `turnstile.reset`; removes the widget on unmount. Without `NEXT_PUBLIC_TURNSTILE_SITE_KEY` it renders nothing and calls `onToken("dev")` once. — antigravity
- [x] T12. `src/components/auth/OtpForm.tsx` (client, no next-intl inside): props `{ purpose; locale; labels: OtpLabels; next?: string; onDone(next: string): void }` (`OtpLabels` type exported here, includes `errors: Record<ErrorCode, string>`). Step 1 email + Turnstile + Send; step 2 six numeric boxes (`inputMode="numeric"`, `autoComplete="one-time-code"` on the first, paste fills all, Backspace moves back), Verify, Resend after a 30 s countdown, "Change email". Pending states disable buttons. Errors under the field with `role="alert"`. Styling from theme tokens and `buttonClass()`. — antigravity
- [x] T13. `messages/en.json` + `hi.json`: namespace `errors` (one friendly line per `ERROR_CODES` entry) and `auth` (all `OtpLabels` texts). Hindi written by us. — antigravity
- [x] T14. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No pages, no admin UI (B11), no account UI (B19). No JWT, no auth library.

## Done-notes
- Files created: `src/lib/validation/auth.ts`, `src/server/auth/{session,otp,turnstile,claims,guards,actions}.ts`, `src/server/email/{send,components}.tsx`, `src/server/email/templates/OtpEmail.tsx`, `src/components/auth/{TurnstileWidget,OtpForm}.tsx`.
- Files modified: `messages/en.json`, `messages/hi.json` (`errors`, `auth` namespaces), `package.json`, `pnpm-lock.yaml`.
- Installed: `@react-email/components@^1.0.12`.
- Sessions: customer (30d) & admin (7d) via `randomToken()`, `sha256Hex()`, and `__Host-` cookies in production.
- OTP: 6-digit codes (10m TTL, max 5 attempts), stored as HMAC-SHA256, atomic attempts increment via sql.
- Turnstile: explicit widget with dev bypass when unconfigured; server verification with 8s timeout.
- Email: Resend REST sender with branded `EmailShell` (emerald/gold/ivory theme) and dev logging fallback.
- Migration added: no. Next step B10 mounts R2 media uploads.

## Manual QA (user)
Nothing is visible yet — the OTP flow is tested in B11 (admin login). Check only: `pnpm dev` runs and `pnpm build` passes.
