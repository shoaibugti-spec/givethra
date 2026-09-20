-- Configurable participant contribution and public payment instructions for Dreams.
ALTER TABLE dreams ADD COLUMN contribution_amount REAL NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS dream_payment_accounts (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  method TEXT NOT NULL,
  account_title TEXT,
  account_number TEXT NOT NULL,
  instructions TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dream_payment_accounts_active ON dream_payment_accounts(is_active);
