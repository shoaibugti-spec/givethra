-- Backfill admin_confirmed for legacy completed resolutions.
-- Reason: post 8876c92 logic requires admin_confirmed = 1 to count a resolution
-- as verified/completed. Old rows have status='completed' but admin_confirmed NULL/0.
UPDATE case_resolutions
SET admin_confirmed = 1
WHERE lower(COALESCE(status, '')) IN ('completed', 'approved', 'seeker_confirmed')
  AND (admin_confirmed IS NULL OR admin_confirmed = 0);
