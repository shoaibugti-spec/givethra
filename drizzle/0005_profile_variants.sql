-- Givethra: one account with independent Hero and Requester profiles.
-- Existing profiles data is preserved; this table is additive and safe to backfill.
CREATE TABLE IF NOT EXISTS profile_variants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  profile_role TEXT NOT NULL CHECK (profile_role IN ('hero', 'requester')),
  full_name TEXT,
  phone_number TEXT,
  country TEXT,
  city TEXT,
  bio TEXT,
  preferred_language TEXT DEFAULT 'en',
  avatar_url TEXT,
  cover_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, profile_role)
);
CREATE INDEX IF NOT EXISTS profile_variants_user_idx ON profile_variants(user_id);

-- Preserve the current profile as the initial value for both role variants.
INSERT OR IGNORE INTO profile_variants
  (id, user_id, profile_role, full_name, phone_number, country, city, bio, preferred_language, avatar_url, cover_url, created_at, updated_at)
SELECT lower(hex(randomblob(16))), p.user_id, r.profile_role, p.full_name, p.phone_number, p.country, p.city, p.bio,
       COALESCE(p.preferred_language, 'en'), p.avatar_url, p.cover_url,
       COALESCE(p.created_at, datetime('now')), COALESCE(p.updated_at, datetime('now'))
FROM profiles p
CROSS JOIN (SELECT 'hero' AS profile_role UNION ALL SELECT 'requester') r;

CREATE UNIQUE INDEX IF NOT EXISTS profile_variants_one_per_role ON profile_variants(user_id, profile_role);
