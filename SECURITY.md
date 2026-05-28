# 🔒 Security Documentation — Kajubadam Vocabulary

> **Last Updated:** May 2026
>
> This document lists all security measures implemented across the Kajubadam Vocabulary platform,
> including what was already secure and what has been added/improved.

---

## 📋 Table of Contents

1. [Security Headers](#1-security-headers)
2. [Email Validation](#2-email-validation)
3. [Rate Limiting](#3-rate-limiting)
4. [Admin Panel Security](#4-admin-panel-security)
5. [Payment Security](#5-payment-security)
6. [Authentication Security](#6-authentication-security)
7. [Input Validation & Sanitization](#7-input-validation--sanitization)
8. [Infrastructure Security](#8-infrastructure-security)
9. [Git & Repository Security](#9-git--repository-security)
10. [Email Authentication (DNS)](#10-email-authentication-dns)
11. [Configuration Checklist](#11-configuration-checklist)

---

## 1. Security Headers

All HTTP responses include security headers via `middleware.ts`:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS for 1 year |
| `X-Frame-Options` | `DENY` | Block clickjacking (no iframes) |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter enable |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Never send full URL to other origins |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), ...` | Restrict browser features |
| `Content-Security-Policy` | Script, style, font, etc. restrictions | Prevent XSS and data injection |
| `Cache-Control` | `no-store, no-cache, must-revalidate` | Prevent caching of HTML pages |

**CSP Details:**
- Scripts: Only from `self`, Razorpay checkout, Google Tag Manager
- Styles: Only from `self`, Google Fonts
- Frames: Only Razorpay checkout, Supabase auth
- Connections: Only to Razorpay API, Supabase, Google Analytics
- Forms: Only to `self`
- Objects, Base-URI: Restricted to `self`

---

## 2. Email Validation

**New:** Implemented in `lib/email-validator.ts`

### Validation Layers

| Layer | Check | Implementation |
|-------|-------|----------------|
| 1 | Format validation | RFC 5322 simplified regex (`/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/`) |
| 2 | TLD validation | Must end with `.domain` (2+ chars TLD) |
| 3 | Length checks | 3–254 chars total, domain ≤ 253 chars |
| 4 | Domain MX records | DNS lookup via `dns.resolveMx()` — ensures domain can receive emails |
| 5 | Disposable email blocking | 200+ known temporary email providers blocked (mailinator, temp-mail, guerrillamail, etc.) |

### Where Email Validation is Applied

| Route | What Happens |
|-------|--------------|
| `POST /api/auth/send-otp` | Full validation (MX + disposable check) before sending OTP |
| `POST /api/payment/create-order` | Full validation before creating payment order |
| `POST /api/admin/purchases` | Format + disposable check (MX skipped for admin ops) |

### Disposable Email Blocklist

200+ known disposable email domains are blocked, including:
- `mailinator.com`, `10minutemail.com`, `guerrillamail.com`
- `tempmail.com`, `yopmail.com`, `trashmail.com`
- `maildrop.cc`, `getnada.com`, `sharklasers.com`
- And many more (see `lib/email-validator.ts` for full list)

---

## 3. Rate Limiting

**New:** Implemented in `lib/rate-limiter.ts`

In-memory rate limiter with IP-based tracking. Note: For production at scale, replace with Upstash Rate Limit or Arcjet.

| Limiter | Window | Max Requests | Applied To |
|---------|--------|-------------|------------|
| `auth` | 1 minute | 5 | OTP send, OTP verify |
| `payment` | 1 minute | 10 | Order create, payment verify |
| `admin` | 1 minute | 20 | Admin purchases, transactions |
| `general` | 1 minute | 30 | General API (purchases lookup) |
| `strict` | 1 minute | 3 | Admin password verification |

---

## 4. Admin Panel Security

### Route Obscurity

| Before | After | Status |
|--------|-------|--------|
| `/admin` | `/iswebkaram` | ✅ Moved to secret route |
| Old `/admin` | Returns 404 | ✅ Hidden (not redirected) |

### Authentication Hardening

| Measure | Implementation |
|---------|---------------|
| No hardcoded password | `ADMIN_PASSWORD` env var ONLY — no fallback in code |
| Token-based auth | `x-admin-token` header required for all admin API calls |
| Failed attempt tracking | IP, timestamp, and count logged to console |
| IP rate limiting | 10 failed attempts = blocked for 15 minutes |
| Admin verification rate limit | 3 requests/minute/IP |

### Admin API Routes

All admin API routes require:
1. Valid `x-admin-token` header
2. Under rate limit threshold
3. Not IP-blocked (for verify route)

---

## 5. Payment Security

| Feature | Status | Details |
|---------|--------|---------|
| Razorpay signature verification | ✅ Already secure | HMAC-SHA256 verification of payment responses |
| Razorpay webhook HMAC | ✅ Already secure | Webhook payload verified with shared secret |
| Server-side price validation | ✅ Already secure | Prices validated server-side, not from frontend |
| Payment ID format validation | ✅ New | Regex validation (`pay_...` format) |
| Order ID format validation | ✅ New | Regex validation (`order_...` format) |
| Webhook payload JSON validation | ✅ New | Try-catch JSON parsing with error response |
| Rate limiting on payment routes | ✅ New | 10 requests/minute/IP |

---

## 6. Authentication Security

| Measure | Status | Details |
|---------|--------|---------|
| Supabase OTP-based auth | ✅ Already secure | Time-limited one-time passwords |
| Email validation before OTP | ✅ New | MX + disposable check before sending |
| Rate limited OTP sending | ✅ New | 5 requests/minute/IP |
| Rate limited OTP verification | ✅ New | 5 requests/minute/IP |
| Session-based access | ✅ Already secure | Supabase session tokens |
| Version-based localStorage purge | ✅ Already secure | Clears stale access on deploy |

---

## 7. Input Validation & Sanitization

**New:** Implemented in `lib/input-validator.ts`

### Functions

| Function | Purpose |
|----------|---------|
| `sanitizeString()` | Trim, remove null bytes, collapse spaces, truncate |
| `sanitizeEmail()` | Lowercase, trim, remove dangerous chars, truncate |
| `validateRequired()` | Check required fields exist and are non-empty |
| `validateEnum()` | Check value is in allowed list |
| `isValidPaymentId()` | Validate Razorpay payment ID format (`pay_...`) |
| `isValidOrderId()` | Validate Razorpay order ID format (`order_...`) |
| `stripHtml()` | Remove HTML tags, javascript: URIs, event handlers |
| `isValidUUID()` | Validate UUID v4 format |

---

## 8. Infrastructure Security

### Already Secure

| Feature | Details |
|---------|---------|
| Server-side Supabase | Keys kept in serverless functions, not exposed to client |
| No sensitive data in localStorage | Only access flags, no tokens/secrets |
| SQL injection prevention | Parameterized queries via Supabase RPC |
| Next.js XSS protection | Built-in React/Next.js automatic escaping |
| Razorpay keys | Key secret is server-only |

### New Security Headers (via middleware)

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Restricted camera, mic, geolocation, etc. |
| `Content-Security-Policy` | Strict CSP rules |

---

## 9. Git & Repository Security

### .gitignore Updates

Patterns added:
- `*.key`, `*.pem`, `*.cert`, `*.crt`, `*.p12`, `*.pfx` — SSL/TLS certificates
- `*.sql.gz`, `*.sql.bak` — Database dumps
- `secrets/` — Sensitive data directory
- `debug-*.log` — Debug logs with potential PII

### Already Secured

| Feature | Status |
|---------|--------|
| `.env` files ignored | ✅ All `.env.*` except `.env.example` |
| Vercel directory ignored | ✅ `/vercel` |
| GitHub secret scanning | ✅ Automated (GitHub default) |

---

## 10. Email Authentication (DNS)

To prevent email spoofing, configure these DNS records for your domain:

| Record | Type | Value | Purpose |
|--------|------|-------|---------|
| SPF | TXT | `v=spf1 include:_spf.google.com ~all` | Authorized mail servers |
| DKIM | TXT | (provided by email service) | Cryptographic email signing |
| DMARC | TXT | `v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com` | Reject fake emails |

### Recommended DNS Settings

1. **SPF Record** — Add a TXT record for your root domain:
   ```
   v=spf1 include:_spf.google.com include:spf.improvmx.com ~all
   ```
   (Adjust include values based on your email provider)

2. **DKIM Record** — Provided by your email service (Google Workspace, ImprovMX, etc.)

3. **DMARC Record** — Add a TXT record for `_dmarc.yourdomain.com`:
   ```
   v=DMARC1; p=quarantine; rua=mailto:admin@kajubadamvocabulary.in; pct=100
   ```

---

## 11. Configuration Checklist

### Required Environment Variables

| Variable | Where to Set | Status |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel | ⚠️ Must keep secret |
| `ADMIN_PASSWORD` | `.env.local` + Vercel | ⚠️ **MUST SET — no fallback!** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `.env.local` + Vercel | ✅ |
| `RAZORPAY_KEY_SECRET` | `.env.local` + Vercel | ⚠️ Must keep secret |
| `RAZORPAY_WEBHOOK_SECRET` | `.env.local` + Vercel | ⚠️ Must keep secret |
| `SITE_URL` | `.env.local` + Vercel | ✅ |

### Vercel Deployment Checklist

- [ ] All env vars set in Vercel dashboard
- [ ] Strong `ADMIN_PASSWORD` (min 16 chars, mixed case + numbers + symbols)
- [ ] Razorpay webhook configured to point to `/api/payment/webhook`
- [ ] Supabase RLS policies enabled on all tables
- [ ] `SITE_URL` matches production domain
- [ ] CSP headers reviewed for any third-party integrations

---

## Summary: What Changed

### 🆕 New Files Created
| File | Purpose |
|------|---------|
| `lib/email-validator.ts` | Multi-layer email validation (MX + disposable blocking) |
| `lib/rate-limiter.ts` | IP-based rate limiting for API routes |
| `lib/input-validator.ts` | Input sanitization and validation utilities |
| `app/iswebkaram/page.tsx` | Admin panel at secret route |
| `.env.example` | Environment variables template |
| `SECURITY.md` | This documentation |

### 📝 Files Modified
| File | Changes |
|------|---------|
| `middleware.ts` | Added CSP, HSTS, X-Frame-Options, Permissions-Policy, etc. |
| `lib/admin-auth.ts` | Removed fallback password, added IP tracking, rate limiting |
| `app/api/auth/send-otp/route.ts` | Email validation + rate limiting |
| `app/api/auth/verify-otp/route.ts` | Rate limiting |
| `app/api/payment/create-order/route.ts` | Email validation + rate limiting |
| `app/api/payment/verify/route.ts` | Input validation + rate limiting |
| `app/api/payment/webhook/route.ts` | Input validation + JSON sanitization |
| `app/api/admin/verify/route.ts` | Rate limiting + IP blocking |
| `app/api/admin/transactions/route.ts` | Rate limiting |
| `app/api/admin/purchases/route.ts` | Email validation + rate limiting |
| `app/api/purchases/route.ts` | Rate limiting + email sanitization |
| `.gitignore` | Security patterns added |
| Old `/admin` route | Returns 404 (hidden) |

### 🔒 Already Secure (No Changes Needed)
- Razorpay signature verification
- Razorpay webhook HMAC verification
- Server-side price validation
- Supabase OTP-based authentication
- Version-based localStorage purge
- SQL injection prevention (parameterized queries)
- No sensitive data in localStorage
- Next.js automatic XSS protection
