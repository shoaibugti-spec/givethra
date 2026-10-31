-- Help Me (video appeals). Additive migration: does not touch Help cases, KYC, wallets or Dreams.
-- Amounts are stored in the appeal's LOCAL currency (what the hero actually pays);
-- the goal is fixed in USD cents and converted once, when the appeal is created.

CREATE TABLE IF NOT EXISTS helpme_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT OR IGNORE INTO helpme_settings (key, value) VALUES
  ('goal_usd_cents', '210'),
  ('post_gap_days', '3'),
  ('helped_cooldown_days', '7'),
  ('retention_days', '90'),
  ('report_hide_threshold', '5'),
  ('pending_expiry_days', '7');

-- Starting exchange rates (local currency per 1 USD). Admin keeps these current.
CREATE TABLE IF NOT EXISTS helpme_fx (
  currency TEXT PRIMARY KEY,
  per_usd REAL NOT NULL CHECK (per_usd > 0),
  updated_at TEXT NOT NULL
);
INSERT OR IGNORE INTO helpme_fx (currency, per_usd, updated_at) VALUES
  ('USD', 1, '2026-10-30T00:00:00.000Z'),
  ('PKR', 278, '2026-10-30T00:00:00.000Z'),
  ('INR', 88, '2026-10-30T00:00:00.000Z'),
  ('BDT', 122, '2026-10-30T00:00:00.000Z'),
  ('LKR', 300, '2026-10-30T00:00:00.000Z'),
  ('NPR', 140, '2026-10-30T00:00:00.000Z'),
  ('AED', 3.67, '2026-10-30T00:00:00.000Z'),
  ('SAR', 3.75, '2026-10-30T00:00:00.000Z'),
  ('QAR', 3.64, '2026-10-30T00:00:00.000Z'),
  ('KWD', 0.31, '2026-10-30T00:00:00.000Z'),
  ('TRY', 42, '2026-10-30T00:00:00.000Z'),
  ('EGP', 48, '2026-10-30T00:00:00.000Z'),
  ('NGN', 1500, '2026-10-30T00:00:00.000Z'),
  ('KES', 129, '2026-10-30T00:00:00.000Z'),
  ('GHS', 14, '2026-10-30T00:00:00.000Z'),
  ('ZAR', 18, '2026-10-30T00:00:00.000Z'),
  ('IDR', 16500, '2026-10-30T00:00:00.000Z'),
  ('MYR', 4.2, '2026-10-30T00:00:00.000Z'),
  ('PHP', 58, '2026-10-30T00:00:00.000Z'),
  ('GBP', 0.77, '2026-10-30T00:00:00.000Z'),
  ('EUR', 0.87, '2026-10-30T00:00:00.000Z'),
  ('CAD', 1.4, '2026-10-30T00:00:00.000Z'),
  ('AUD', 1.53, '2026-10-30T00:00:00.000Z');

-- Video uploads waiting to be attached to an appeal (cleaned up daily if unused).
CREATE TABLE IF NOT EXISTS helpme_uploads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  video_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  used_appeal_id TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_helpme_uploads_user ON helpme_uploads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_helpme_uploads_unused ON helpme_uploads(used_appeal_id, created_at);

CREATE TABLE IF NOT EXISTS helpme_appeals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  -- pending_review | published | under_review (hidden after reports) | helped | rejected | removed | expired
  status TEXT NOT NULL DEFAULT 'pending_review',
  description TEXT NOT NULL,
  video_key TEXT NOT NULL,
  video_content_type TEXT NOT NULL,
  video_size INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  account_country TEXT NOT NULL,
  currency TEXT NOT NULL,
  fx_per_usd REAL NOT NULL,
  goal_usd_cents INTEGER NOT NULL,
  goal_local REAL NOT NULL,
  raised_local REAL NOT NULL DEFAULT 0,
  raised_usd_cents INTEGER NOT NULL DEFAULT 0,
  pay_method TEXT NOT NULL,
  pay_bank_name TEXT,
  pay_account_title TEXT NOT NULL,
  pay_account_number TEXT NOT NULL,
  pay_account_norm TEXT NOT NULL,
  prays_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  reposts_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  published_at TEXT,
  helped_at TEXT,
  expires_at TEXT,
  video_deleted_at TEXT
);
-- One live appeal per person, enforced by the database itself (no race conditions).
CREATE UNIQUE INDEX IF NOT EXISTS uq_helpme_one_live_appeal
  ON helpme_appeals(user_id) WHERE status IN ('pending_review', 'published', 'under_review');
CREATE INDEX IF NOT EXISTS idx_helpme_feed_published ON helpme_appeals(status, published_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_helpme_feed_helped ON helpme_appeals(status, helped_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_helpme_user ON helpme_appeals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_helpme_expiry ON helpme_appeals(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_helpme_account_norm ON helpme_appeals(pay_account_norm, status);

-- A hero's payment proof for an appeal. Money moves person-to-person; Givethra only verifies.
CREATE TABLE IF NOT EXISTS helpme_help (
  id TEXT PRIMARY KEY,
  appeal_id TEXT NOT NULL REFERENCES helpme_appeals(id) ON DELETE CASCADE,
  helper_user_id TEXT NOT NULL,
  amount_claimed REAL NOT NULL CHECK (amount_claimed > 0),
  amount_approved REAL,
  currency TEXT NOT NULL,
  trx_id TEXT NOT NULL,
  trx_norm TEXT NOT NULL,
  proof_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL
);
-- The same transaction number can never be used twice (rejected ones are free to retry).
CREATE UNIQUE INDEX IF NOT EXISTS uq_helpme_trx_live ON helpme_help(trx_norm) WHERE status IN ('pending', 'approved');
CREATE INDEX IF NOT EXISTS idx_helpme_help_appeal ON helpme_help(appeal_id, status);
CREATE INDEX IF NOT EXISTS idx_helpme_help_queue ON helpme_help(status, created_at);
CREATE INDEX IF NOT EXISTS idx_helpme_help_helper ON helpme_help(helper_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS helpme_prays (
  appeal_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (appeal_id, user_id)
);
CREATE TABLE IF NOT EXISTS helpme_reposts (
  appeal_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (appeal_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_helpme_reposts_user ON helpme_reposts(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS helpme_comments (
  id TEXT PRIMARY KEY,
  appeal_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_helpme_comments_appeal ON helpme_comments(appeal_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_helpme_comments_user ON helpme_comments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS helpme_reports (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('appeal', 'comment')),
  target_id TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  UNIQUE (target_type, target_id, reporter_id)
);
CREATE INDEX IF NOT EXISTS idx_helpme_reports_open ON helpme_reports(status, target_type, target_id);
