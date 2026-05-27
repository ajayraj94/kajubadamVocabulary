# Price Change Guide — Kajubadam Vocabulary

## Change Price Manually

**File:** `lib/products.ts`

Find the `PRODUCTS` object and edit the `defaultPrice` and `label` fields:

### Part 1 — ₹299
```typescript
part1: {
    id: "part1",
    label: "Part 1 — ₹299",   // ← Display price change here
    defaultPrice: 299,          // ← Actual price change here (in INR)
    color: "blue",
},
```

### Part 2 — ₹399
```typescript
part2: {
    id: "part2",
    label: "Part 2 — ₹399",   // ← Display price change here
    defaultPrice: 399,          // ← Actual price change here (in INR)
    color: "orange",
},
```

### Error Detection — ₹110
```typescript
errorDetection: {
    id: "errorDetection",
    label: "Error Detection — ₹110", // ← Display price change here
    defaultPrice: 110,               // ← Actual price change here (in INR)
    color: "red",
},
```

## Important Notes

1. **`defaultPrice`** — Price in INR (e.g., `299` means ₹299)
2. **`label`** — Display text (update the ₹ amount here too)
3. **After editing:** Git commit + push → Vercel auto-deploys

## Override via Env Var (Alternative)

Set on Vercel dashboard (overrides `defaultPrice`):
- `NEXT_PUBLIC_PART1_PRICE` → `299`
- `NEXT_PUBLIC_PART2_PRICE` → `399`
- `NEXT_PUBLIC_ERRORDETECTION_PRICE` → `110`
