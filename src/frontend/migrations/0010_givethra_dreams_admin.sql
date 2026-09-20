-- Additive Givethra Dreams module. Keeps Help, KYC and existing wallets separate.
CREATE TABLE IF NOT EXISTS dreams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  dream_price REAL NOT NULL DEFAULT 0,
  actual_market_price REAL,
  participant_capacity INTEGER NOT NULL DEFAULT 0,
  internal_percentage_unit REAL,
  credit_award REAL NOT NULL DEFAULT 0,
  announcement_at TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  publication_status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS dream_participations (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  full_name TEXT,
  father_husband_name TEXT,
  cnic_number TEXT,
  mobile_number TEXT,
  payment_method TEXT,
  contribution_amount REAL NOT NULL,
  transaction_id TEXT NOT NULL,
  proof_url TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval',
  registration_number TEXT,
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(dream_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_dreams_publication ON dreams(publication_status, status);
CREATE INDEX IF NOT EXISTS idx_dream_participations_dream ON dream_participations(dream_id, status);
CREATE INDEX IF NOT EXISTS idx_dream_participations_user ON dream_participations(user_id, status);
