CREATE TABLE IF NOT EXISTS dream_participation_history (
  id TEXT PRIMARY KEY,
  participation_id TEXT NOT NULL,
  dream_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  registration_number TEXT,
  changed_by TEXT,
  changed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dream_participation_history_participation
  ON dream_participation_history(participation_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_dream_participation_history_user_dream
  ON dream_participation_history(user_id, dream_id, changed_at DESC);

INSERT INTO dream_participation_history
  (id, participation_id, dream_id, user_id, from_status, to_status, note, registration_number, changed_by, changed_at)
SELECT
  'legacy-' || p.id,
  p.id,
  p.dream_id,
  p.user_id,
  NULL,
  p.status,
  CASE
    WHEN lower(COALESCE(p.status, '')) = 'rejected' THEN 'Legacy rejection. Reason: ' || COALESCE(p.rejection_reason, 'Payment proof was not approved')
    WHEN lower(COALESCE(p.status, '')) IN ('approved', 'active', 'completed') THEN 'Legacy approved participation.'
    ELSE 'Legacy participation submission.'
  END,
  p.registration_number,
  p.reviewed_by,
  COALESCE(p.reviewed_at, p.created_at)
FROM dream_participations p
WHERE NOT EXISTS (
  SELECT 1 FROM dream_participation_history h WHERE h.participation_id = p.id
);
