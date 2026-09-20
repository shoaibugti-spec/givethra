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
  announcement_at TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  publication_status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dream_participations (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
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

INSERT OR IGNORE INTO dreams (id, name, category, description, dream_price, actual_market_price, participant_capacity, internal_percentage_unit, status, publication_status, created_at, updated_at) VALUES
('dream-family-car', 'A Family Car', 'Cars', 'A dependable car can make work, school and everyday life more accessible.', 200000, 160000, 1000, 1, 'open', 'published', datetime('now'), datetime('now')),
('dream-washing-machine', 'A Washing Machine', 'Home Appliances', 'A practical home dream that gives a family more time and dignity.', 85000, 70000, 500, 1, 'open', 'published', datetime('now'), datetime('now')),
('dream-air-conditioner', 'An Air Conditioner', 'Home Appliances', 'Comfort at home can be meaningful, especially for children and elders.', 125000, 105000, 750, 1, 'open', 'published', datetime('now'), datetime('now')),
('dream-television', 'A Family Television', 'Home & Lifestyle', 'A shared screen for learning, connection and family moments.', 65000, 55000, 400, 1, 'open', 'published', datetime('now'), datetime('now')),
('dream-motorcycle', 'A Motorcycle', 'Mobility', 'A step toward easier commuting, earning and independence.', 160000, 135000, 800, 1, 'open', 'published', datetime('now'), datetime('now')),
('dream-refrigerator', 'A Refrigerator', 'Home Appliances', 'A lasting home essential that supports a healthier daily life.', 110000, 92000, 600, 1, 'open', 'published', datetime('now'), datetime('now'));
