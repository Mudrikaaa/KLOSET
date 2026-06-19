-- Kloset Database Schema Creation Script
-- Directly runs in PostgreSQL

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS outfit_catalog CASCADE;
DROP TABLE IF EXISTS wardrobe_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wardrobe Items Table
CREATE TABLE wardrobe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Tops', 'Bottoms', 'Dresses', 'Ethnic', 'Outers', 'Shoes')),
    color VARCHAR(50) NOT NULL,
    style VARCHAR(50) NOT NULL,
    fit VARCHAR(50),
    fabric VARCHAR(50),
    length VARCHAR(50),
    pattern VARCHAR(50),
    neckline VARCHAR(50),
    sleeve VARCHAR(50),
    season VARCHAR(50) CHECK (season IN ('Summer', 'Winter', 'Monsoon', 'All-season')),
    occasions TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_wardrobe_user_id ON wardrobe_items(user_id);

-- 3. Outfit Catalog Table
CREATE TABLE outfit_catalog (
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

-- 4. Swipes Table
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id UUID NOT NULL REFERENCES outfit_catalog(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('like', 'dislike')),
    swiped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, outfit_id)
);

CREATE INDEX idx_swipes_user_id ON swipes(user_id);

-- =========================================================================
-- SEED DATA FOR OUTFIT CATALOG
-- Includes high-quality styled outfits matching specific profiles and occasions
-- =========================================================================

INSERT INTO outfit_catalog 
(id, title, image_url, occasions, style, body_types, skin_tones, formality, coverage, season, color_palette, description, explanation)
VALUES
-- Seed 1: Traditional Ethnic Festive Outfit
(
  'a0a1a2a3-b4b5-c6c7-d8d9-e0e1e2e3e4f5',
  'Classic Ivory & Gold Anarkali Set',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  ARRAY['Diwali Party (Family)', 'Regional Festival', 'Wedding (Close Family)'],
  'Ethnic',
  ARRAY['Hourglass', 'Pear', 'Apple', 'Rectangle'],
  ARRAY['Fair', 'Wheatish', 'Dusky', 'Deep'],
  'Festive',
  'Conservative',
  'All-season',
  ARRAY['Ivory', 'Gold', 'Beige'],
  'A premium classic ivory georgette Anarkali suit with intricate gold zardozi embroidery.',
  'The traditional ivory and gold combination matches festive occasions. Anarkali styles look great on hourglass and pear shapes by accentuating the waist and flowing gracefully.'
),
-- Seed 2: Chic Western Brunch Outfit
(
  'b0b1b2b3-c4c5-d6d7-d8d9-e0e1e2e3e4f5',
  'Sage Green Linen Blazer Outfit',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
  ARRAY['Brunch / Cafe', 'Casual Outing', 'Office (Startup)'],
  'Western',
  ARRAY['Hourglass', 'Rectangle', 'Inverted Triangle'],
  ARRAY['Fair', 'Wheatish', 'Dusky'],
  'Smart Casual',
  'Moderate',
  'Summer',
  ARRAY['Sage Green', 'White', 'Beige'],
  'Relaxed fit sage green linen blazer paired with a white cotton ribbed tank top and beige wide-leg trousers.',
  'Sage green complements wheatish and dusky skin tones. The structured shoulders of the blazer balance inverted triangle and rectangle silhouettes beautifully.'
),
-- Seed 3: Contemporary Fusion Night Out Outfit
(
  'c0c1c2c3-d4d5-d6d7-d8d9-e0e1e2e3e4f5',
  'Indigo Crop Top & Palazzo Fusion Set',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
  ARRAY['Night Out', 'Dinner Date', 'Brunch / Cafe'],
  'Fusion',
  ARRAY['Hourglass', 'Pear', 'Rectangle'],
  ARRAY['Fair', 'Wheatish', 'Dusky', 'Deep'],
  'Smart Casual',
  'Moderate',
  'Summer',
  ARRAY['Indigo', 'Blue', 'White'],
  'Indigo printed crop top paired with high-waisted linen palazzos and a matching light overlay jacket.',
  'Perfect fusion style for a night out. The crop top and high-waisted palazzo highlight the waist, making it ideal for hourglass and pear shapes.'
),
-- Seed 4: Streetwear Graphic Casual Outfit
(
  'd0d1d2d3-e4e5-d6d7-d8d9-e0e1e2e3e4f5',
  'Oversized Cobalt Graphic Tee & Cargo Set',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
  ARRAY['Casual Outing', 'Mall / Shopping Day', 'Night Out'],
  'Streetwear',
  ARRAY['Hourglass', 'Pear', 'Rectangle', 'Inverted Triangle', 'Apple'],
  ARRAY['Fair', 'Wheatish', 'Dusky', 'Deep'],
  'Casual',
  'Moderate',
  'All-season',
  ARRAY['Cobalt Blue', 'Black', 'Grey'],
  'Heavyweight oversized graphic t-shirt in cobalt blue, styled with relaxed black multi-pocket cargo pants and retro sneakers.',
  'A comfy, streetwear-ready fit perfect for casual wear. The relaxed fit suits all body types, while cobalt blue stands out on dusky and deep skin tones.'
);
