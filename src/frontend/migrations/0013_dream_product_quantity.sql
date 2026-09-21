-- Keep product quantity separate from internal participant capacity.
ALTER TABLE dreams ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
