-- Database Migration: Profile Expansion
-- Expands the users table with new profile fields

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS age_range VARCHAR(20),
  ADD COLUMN IF NOT EXISTS top_size VARCHAR(10),
  ADD COLUMN IF NOT EXISTS bottom_size VARCHAR(10),
  ADD COLUMN IF NOT EXISTS bra_size VARCHAR(10),
  ADD COLUMN IF NOT EXISTS shoe_size VARCHAR(10),
  ADD COLUMN IF NOT EXISTS comfort_zones TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS city VARCHAR(50),
  ADD COLUMN IF NOT EXISTS budget_tier VARCHAR(30),
  ADD COLUMN IF NOT EXISTS jewelry_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS avoid_list TEXT[] DEFAULT '{}';
