-- Givethra: one-time profile setup completion marker.
-- Additive migration; existing users remain signed in and can complete setup once.
ALTER TABLE users ADD COLUMN profile_setup_completed_at TEXT;
