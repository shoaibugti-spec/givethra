-- Additional participant identity fields and admin-selected Dream winner tracking.
ALTER TABLE dream_participations ADD COLUMN province TEXT;
ALTER TABLE dream_participations ADD COLUMN city TEXT;
ALTER TABLE dream_participations ADD COLUMN address TEXT;
ALTER TABLE dream_participations ADD COLUMN postal_code TEXT;
ALTER TABLE dreams ADD COLUMN winner_participation_id TEXT;
ALTER TABLE dreams ADD COLUMN completed_at TEXT;
