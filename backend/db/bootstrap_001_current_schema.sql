-- ============================================================================
-- Bootstrap 001 — CURRENT schema for a FRESH database (e.g. a new Render
-- PostgreSQL instance). Safe and idempotent: CREATE IF NOT EXISTS only, no
-- DROPs, no data. This file produces the same schema as the historical path
-- (schema.legacy.sql tables + migration_001 + migration_002) in one shot.
--
-- Ongoing schema changes still go through numbered migration files
-- (migration_003_..., ...) — run those after this bootstrap. Running the
-- migrations 001/002 after this bootstrap is harmless (they are idempotent).
--
-- Full fresh-DB setup: node scripts/setup_db.js  (bootstrap → migrations → seed)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    height VARCHAR(50) CHECK (height IN ('Petite', 'Average', 'Tall')),
    body_shape VARCHAR(50) CHECK (body_shape IN ('Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle')),
    skin_tone VARCHAR(50) CHECK (skin_tone IN ('Fair', 'Wheatish', 'Dusky', 'Deep')),
    undertone VARCHAR(50) CHECK (undertone IN ('Warm', 'Cool', 'Neutral')),
    style_pref VARCHAR(50) CHECK (style_pref IN ('Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear')),
    coverage_preference VARCHAR(50) CHECK (coverage_preference IN ('Modest', 'Moderate', 'Open')),
    occasion_frequency VARCHAR(100),
    color_comfort VARCHAR(100),
    -- profile expansion (migration_001)
    age_range VARCHAR(20),
    top_size VARCHAR(10),
    bottom_size VARCHAR(10),
    bra_size VARCHAR(10),
    shoe_size VARCHAR(10),
    comfort_zones TEXT[] DEFAULT '{}',
    city VARCHAR(50),
    budget_tier VARCHAR(30),
    jewelry_types TEXT[] DEFAULT '{}',
    avoid_list TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wardrobe items (current garment taxonomy, colors[] array from day one)
CREATE TABLE IF NOT EXISTS wardrobe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Tops', 'Bottoms', 'Dresses',
        'Kurtas & Tunics', 'Sarees', 'Lehengas', 'Suits & Sets',
        'Dupattas & Stoles', 'Ethnic Bottoms',
        'Outers', 'Shoes', 'Accessories'
    )),
    -- legacy single colour kept for backwards compatibility; colors[] is the
    -- source of truth (first element mirrors this column)
    color VARCHAR(50) NOT NULL,
    colors TEXT[] DEFAULT '{}',
    style VARCHAR(50) NOT NULL,
    fit VARCHAR(50),
    fabric VARCHAR(50),
    length VARCHAR(50),
    pattern VARCHAR(50),
    neckline VARCHAR(50),
    sleeve VARCHAR(50),
    season VARCHAR(50) CHECK (season IN ('Summer', 'Winter', 'Monsoon', 'All-season')),
    -- garment expansion (migration_002)
    sub_type VARCHAR(100),
    waist_position VARCHAR(30),
    structure VARCHAR(50),
    embellishment VARCHAR(50),
    opacity VARCHAR(30),
    occasions TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wardrobe_user_id ON wardrobe_items(user_id);

-- 3. Outfit catalog ("ideas from outside")
CREATE TABLE IF NOT EXISTS outfit_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    occasions TEXT[] NOT NULL DEFAULT '{}',
    style VARCHAR(50) NOT NULL CHECK (style IN ('Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear')),
    body_types TEXT[] NOT NULL DEFAULT '{}',
    skin_tones TEXT[] NOT NULL DEFAULT '{}',
    formality VARCHAR(50) CHECK (formality IN ('Casual', 'Smart Casual', 'Semi-formal', 'Formal', 'Festive', 'Party')),
    coverage VARCHAR(50) CHECK (coverage IN ('Minimal', 'Moderate', 'Conservative')),
    season VARCHAR(50) CHECK (season IN ('Summer', 'Winter', 'Monsoon', 'All-season')),
    color_palette TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Swipes
CREATE TABLE IF NOT EXISTS swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id UUID NOT NULL REFERENCES outfit_catalog(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('like', 'dislike')),
    swiped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, outfit_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
