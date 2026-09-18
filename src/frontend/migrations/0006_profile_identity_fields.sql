-- Givethra: searchable, user-controlled profile identity fields.
-- Additive migration; existing profile and role-variant data remains intact.
ALTER TABLE profiles ADD COLUMN username TEXT;
ALTER TABLE profiles ADD COLUMN first_name TEXT;
ALTER TABLE profiles ADD COLUMN last_name TEXT;
ALTER TABLE profiles ADD COLUMN age INTEGER;
ALTER TABLE profiles ADD COLUMN gender TEXT;
ALTER TABLE profiles ADD COLUMN id_number TEXT;
ALTER TABLE profiles ADD COLUMN country_code TEXT;

ALTER TABLE profile_variants ADD COLUMN username TEXT;
ALTER TABLE profile_variants ADD COLUMN first_name TEXT;
ALTER TABLE profile_variants ADD COLUMN last_name TEXT;
ALTER TABLE profile_variants ADD COLUMN age INTEGER;
ALTER TABLE profile_variants ADD COLUMN gender TEXT;
ALTER TABLE profile_variants ADD COLUMN id_number TEXT;
ALTER TABLE profile_variants ADD COLUMN country_code TEXT;

CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profile_variants_username_idx ON profile_variants(username);
