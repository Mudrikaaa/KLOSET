-- Database Migration 003: Closet sections (shelves & drawers) + garment extraction columns
--
-- Shelves hold hanging garments; drawers hold folded/non-hanging things
-- (footwear, accessories, bags — anything). Every wardrobe item belongs to a
-- section; section_id is nullable at the SQL level only so that existing rows
-- and section deletions never orphan-crash — application code lazily creates
-- per-user defaults and reassigns on delete, so in practice everything lives
-- in a shelf or a drawer.

CREATE TABLE IF NOT EXISTS closet_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(60) NOT NULL,
    kind VARCHAR(10) NOT NULL CHECK (kind IN ('shelf', 'drawer')),
    -- position orders sections within a user's closet (drag-to-reorder later);
    -- scoped per user, gaps allowed, ties broken by created_at
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_closet_sections_user ON closet_sections(user_id, position);

ALTER TABLE wardrobe_items
  ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES closet_sections(id) ON DELETE SET NULL,
  -- transparent-PNG garment cutout (rembg / SegFormer), stored on Cloudinary
  -- alongside the original photo in image_url; NULL when extraction was
  -- skipped or failed (the save must never depend on it)
  ADD COLUMN IF NOT EXISTS cutout_url TEXT,
  -- when one uploaded photo is split into multiple garments (worn outfit →
  -- top + bottom), all resulting rows share this id so the UI can show
  -- "from the same photo" later
  ADD COLUMN IF NOT EXISTS source_group_id UUID;

CREATE INDEX IF NOT EXISTS idx_wardrobe_section ON wardrobe_items(section_id);
