CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'PKR',
  frequency TEXT NOT NULL DEFAULT 'once' CHECK (frequency IN ('once', 'monthly')),
  payment_method TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  rejection_reason TEXT,
  submitted_at TEXT NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_donations_user ON donations(user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status, submitted_at DESC);

CREATE TABLE IF NOT EXISTS contribution_ledger (
  id TEXT PRIMARY KEY,
  donation_id TEXT,
  case_id TEXT,
  user_id TEXT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('credit', 'debit')),
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'PKR',
  note TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contribution_ledger_created ON contribution_ledger(created_at DESC);

CREATE TABLE IF NOT EXISTS contribution_spending (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'PKR',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_contribution_spending_case ON contribution_spending(case_id, created_at DESC);

CREATE TABLE IF NOT EXISTS contribution_status_history (
  id TEXT PRIMARY KEY,
  donation_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  changed_at TEXT NOT NULL,
  changed_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contribution_history_donation ON contribution_status_history(donation_id, changed_at DESC);
