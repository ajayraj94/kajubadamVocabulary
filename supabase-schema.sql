/**
 * Supabase Database Schema for Kajubadam Vocabulary
 *
 * Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
 *
 * Tables:
 * 1. purchases - stores user purchase records
 *
 * How it works:
 * - When user buys a product, the payment verification API saves a record here
 * - When user logs in with OTP, we look up their purchases and restore access
 * - Email is used as the unique identifier for users
 *
 * 🌟 Products are now DYNAMIC — no hardcoded CHECK constraints!
 *    New products can be added in lib/products.ts without DB changes.
 */

-- ── PURCHASES TABLE ──
-- One row per email, with an array of purchased products
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  products TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases (email);

-- ── TRANSACTIONS TABLE ──
-- Audit log of individual payment transactions
-- No CHECK constraint on product — any product ID is valid (defined in lib/products.ts)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  product TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  payment_id TEXT,
  amount INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_email ON transactions (email);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_id ON transactions (transaction_id);

-- ── HELPER FUNCTION: Upsert purchase ──
-- Adds a product to the user's purchases array (no duplicates)
-- Works with ANY product ID — no hardcoded values!
CREATE OR REPLACE FUNCTION add_purchase(
  p_email TEXT,
  p_product TEXT,
  p_transaction_id TEXT,
  p_payment_id TEXT DEFAULT NULL,
  p_amount INTEGER DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Insert or update purchases table
  INSERT INTO purchases (email, products)
  VALUES (p_email, ARRAY[p_product])
  ON CONFLICT (email)
  DO UPDATE SET
    products = CASE
      WHEN NOT (purchases.products @> ARRAY[p_product])
      THEN purchases.products || ARRAY[p_product]
      ELSE purchases.products
    END,
    updated_at = NOW();

  -- Insert transaction record
  INSERT INTO transactions (email, product, transaction_id, payment_id, amount)
  VALUES (p_email, p_product, p_transaction_id, p_payment_id, p_amount)
  ON CONFLICT (transaction_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════
-- 🚨 FIX for existing DB (if you already have the old schema):
-- Run these lines ONCE in your Supabase SQL Editor:
--
--   ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_product_check;
--
-- After running that, the above CREATE TABLE IF NOT EXISTS will work correctly.
-- ══════════════════════════════════════════════
