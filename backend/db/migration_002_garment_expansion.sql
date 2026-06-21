-- Database Migration: Garment Expansion
-- Expands wardrobe_items table and adds colors array support

-- Expand wardrobe_items table
ALTER TABLE wardrobe_items
  ADD COLUMN IF NOT EXISTS sub_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS waist_position VARCHAR(30),
  ADD COLUMN IF NOT EXISTS structure VARCHAR(50),
  ADD COLUMN IF NOT EXISTS embellishment VARCHAR(50),
  ADD COLUMN IF NOT EXISTS opacity VARCHAR(30);

-- Migrate color (single text) → colors (text array)
-- Step 1: Add new column
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
-- Step 2: Copy existing color values into the array
UPDATE wardrobe_items SET colors = ARRAY[color] WHERE color IS NOT NULL AND colors = '{}';

-- Expand the category constraint
ALTER TABLE wardrobe_items DROP CONSTRAINT IF EXISTS wardrobe_items_category_check;
ALTER TABLE wardrobe_items ADD CONSTRAINT wardrobe_items_category_check
  CHECK (category IN (
    'Tops', 'Bottoms', 'Dresses',
    'Kurtas & Tunics', 'Sarees', 'Lehengas', 'Suits & Sets',
    'Dupattas & Stoles', 'Ethnic Bottoms',
    'Outers', 'Shoes', 'Accessories'
  ));
