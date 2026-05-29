/**
 * Supabase Database Schema for Kajubadam Vocabulary
 *
 * Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
 *
 * Tables:
 * 1. purchases - stores user purchase records
 * 2. transactions - audit log of payment transactions
 *
 * Security:
 * - RLS enabled on both tables
 * - add_purchase() uses SECURITY DEFINER so it bypasses RLS
 * - Direct table access is blocked — all writes go through the RPC function
 *
 * How it works:
 * - When user buys a product, the payment verification API saves a record here
 * - When user logs in with OTP, we look up their purchases and restore access
 * - Email is used as the unique identifier for users
 *
 * 🌟 Products are now DYNAMIC — no hardcoded CHECK constraints!
 *    New products can be added in lib/products.ts without DB changes.
 */

-- ══════════════════════════════════════════════
-- STEP 1: Enable extensions
-- ══════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════════════
-- STEP 2: Create tables
-- ══════════════════════════════════════════════

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
-- Links to Supabase Auth users via user_id
-- No CHECK constraint on product — any product ID is valid (defined in lib/products.ts)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  product TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  payment_id TEXT,
  amount INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_email ON transactions (email);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_id ON transactions (transaction_id);


-- ══════════════════════════════════════════════
-- STEP 3: Create RPC function (SECURITY DEFINER)
-- ══════════════════════════════════════════════

-- 🔐 SECURITY DEFINER = runs as the function owner (superuser)
--    This lets the anon-key client insert into tables even when RLS is ON.
CREATE OR REPLACE FUNCTION add_purchase(
  p_email TEXT,
  p_product TEXT,
  p_transaction_id TEXT,
  p_payment_id TEXT DEFAULT NULL,
  p_amount INTEGER DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
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
  INSERT INTO transactions (user_id, email, product, transaction_id, payment_id, amount)
  VALUES (p_user_id, p_email, p_product, p_transaction_id, p_payment_id, p_amount)
  ON CONFLICT (transaction_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;


-- ══════════════════════════════════════════════
-- STEP 4: Enable Row Level Security
-- ══════════════════════════════════════════════

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;


-- ══════════════════════════════════════════════
-- STEP 5: Create RLS Policies
-- ══════════════════════════════════════════════

-- ── PURCHASES: Allow logged-in users to READ their own row ──
-- This is used by /api/purchases route (which checks auth session first)
CREATE POLICY "users_read_own_purchases" ON purchases
  FOR SELECT
  USING (auth.email() = email);

-- Block all direct INSERT/UPDATE/DELETE on purchases
-- (only the add_purchase RPC should write here)
CREATE POLICY "block_insert_purchases" ON purchases
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "block_update_purchases" ON purchases
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

CREATE POLICY "block_delete_purchases" ON purchases
  FOR DELETE
  USING (false);


-- ── TRANSACTIONS: Allow users to READ their own rows ──
-- This is needed for the frontend to sync purchases after Google login.
CREATE POLICY "users_read_own_transactions" ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Block all direct INSERT/UPDATE/DELETE on transactions
-- (only the add_purchase RPC should write here)
CREATE POLICY "block_insert_transactions" ON transactions
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "block_update_transactions" ON transactions
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

CREATE POLICY "block_delete_transactions" ON transactions
  FOR DELETE
  USING (false);


-- ══════════════════════════════════════════════
-- VERIFICATION QUERIES (run after setup)
-- ══════════════════════════════════════════════

-- Check that RLS is enabled:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--   → purchases  → true
--   → transactions → true

-- Check that the function has SECURITY DEFINER:
--   SELECT proname, prosecdef FROM pg_proc WHERE proname = 'add_purchase';
--   → add_purchase → true

-- Test the RPC (run with anon key context — works if SECURITY DEFINER is set):
--   SELECT add_purchase('test@example.com', 'part1', 'test_tx_123');
--   → Should succeed even if RLS is enabled


-- ══════════════════════════════════════════════
-- 🚨 FIX for existing DB (if you already have the old schema):
-- Run these lines ONCE in your Supabase SQL Editor:
--
--   1. Remove old constraint (if exists):
--      ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_product_check;
--
--   2. Then run this entire file again.
-- ══════════════════════════════════════════════
