# Manual Change Guide — Kajubadam Vocabulary

> **Note:** All env vars are set in **Vercel Dashboard** → Project → Settings → Environment Variables.
> After any env var change, **Redeploy** from Vercel Dashboard → Deployments → Redeploy.

---

## 1. Change Product Price

### Option A: Direct File Edit

**File:** `lib/products.ts`

Find the `PRODUCTS` object and edit `defaultPrice` and `label` fields:

#### Part 1 — ₹299
```typescript
part1: {
    id: "part1",
    label: "Part 1 — ₹299",   // ← Display price change here
    defaultPrice: 299,          // ← Actual price change here (in INR)
    color: "blue",
},
```

#### Part 2 — ₹399
```typescript
part2: {
    id: "part2",
    label: "Part 2 — ₹399",   // ← Display price change here
    defaultPrice: 399,          // ← Actual price change here (in INR)
    color: "orange",
},
```

#### Error Detection — ₹110
```typescript
errorDetection: {
    id: "errorDetection",
    label: "Error Detection — ₹110", // ← Display price change here
    defaultPrice: 110,               // ← Actual price change here (in INR)
    color: "red",
},
```

**After editing:** `git add lib/products.ts` → `git commit -m "Update prices"` → `git push` → Vercel auto-deploys

### Option B: Env Var Override (Vercel Dashboard)

Set these env vars (overrides `defaultPrice`):

| Variable | Example Value |
|----------|--------------|
| `NEXT_PUBLIC_PART1_PRICE` | `299` |
| `NEXT_PUBLIC_PART2_PRICE` | `399` |
| `NEXT_PUBLIC_ERRORDETECTION_PRICE` | `110` |

---

## 2. Change Admin Password

### How Admin Password Works

The admin password has a **fallback chain** (highest priority first):

1. **Vercel env var** `ADMIN_PASSWORD` (production)
2. **`.env` file** `ADMIN_PASSWORD` (local development)
3. **Code fallback** — `"1om@13494"` (if no env var set anywhere)

**Relevant files:**
| File | Purpose |
|------|---------|
| `lib/admin-auth.ts` | Defines `ADMIN_PASSWORD` constant + generates admin token |
| `app/api/admin/verify/route.ts` | Handles login — verifies password against `ADMIN_PASSWORD` |
| `.env` | Local env vars (git-ignored) |

### Change via Env Var (Recommended)

**Production (Vercel):**
- Go to **Vercel Dashboard** → Project → Settings → Environment Variables
- Add/edit `ADMIN_PASSWORD` → new password → Environment: Production → Save
- **Redeploy** from Deployments tab

**Local development:**
- Edit `.env` file → change `ADMIN_PASSWORD=your_new_password`
- Restart dev server

### Change via File Edit (Alternative)

Edit `lib/admin-auth.ts` line 7 — change the fallback value:

```typescript
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "your_new_password_here";
```

**Important:** Do the same in `app/api/admin/verify/route.ts` line 12:

```typescript
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "your_new_password_here";
```

**After editing:** `git add lib/admin-auth.ts app/api/admin/verify/route.ts` → commit → push → Vercel deploys

### Summary: Which Method to Use?

| Scenario | Method |
|----------|--------|
| Change password **now** (production) | Vercel env var → Redeploy |
| Change password for **new clone** | Edit `.env` file locally |
| Change password permanently (in code) | Edit both `.ts` files → Push |
| First time setup | Add `ADMIN_PASSWORD` in Vercel Dashboard |
