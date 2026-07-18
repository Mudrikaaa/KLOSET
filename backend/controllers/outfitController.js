const db = require('../config/db');
// why: all styling knowledge (formality maps, cultural colour rules, occasion
// style profiles) lives in services/stylistRules.js — one designer brain
// shared by the catalog engine and the wardrobe composer. The map below is
// re-exported from there; do not fork it back into this file.
const {
  getAllowedFormalities,
  getOccasionColorBlacklist,
} = require('../services/stylistRules');
const { composeOutfits } = require('../services/outfitComposer');

/**
 * Formatter to convert database outfit row to frontend JSON schema
 */
const formatOutfit = (row) => ({
  id: row.id,
  title: row.title,
  imageUrl: row.image_url,
  occasions: row.occasions || [],
  style: row.style,
  bodyShapes: row.body_types || [], // map body_types -> bodyShapes
  skinTones: row.skin_tones || [],
  formality: row.formality,
  coverage: row.coverage,
  season: row.season,
  colorPalette: row.color_palette || [],
  description: row.description,
  explanation: row.explanation,
  createdAt: row.created_at,
  matchScore: row.match_score !== undefined ? parseInt(row.match_score, 10) : undefined
});

/**
 * Get all outfits in catalog
 * Route: GET /outfits
 */
exports.getAllOutfits = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM outfit_catalog ORDER BY created_at DESC');
    res.status(200).json(result.rows.map(formatOutfit));
  } catch (err) {
    next(err);
  }
};

/**
 * Get outfit by ID
 * Route: GET /outfits/:id
 */
exports.getOutfitById = async (req, res, next) => {
  try {
    const outfitId = req.params.id;
    const result = await db.query('SELECT * FROM outfit_catalog WHERE id = $1', [outfitId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Outfit not found.' });
    }

    res.status(200).json(formatOutfit(result.rows[0]));
  } catch (err) {
    next(err);
  }
};

/**
 * Rule-based Outfit Suggestions matching occasion and user profile.
 * Route: GET /suggestions   ("ideas from outside" — the curated catalog)
 * Query parameters:
 *   - occasion: (required) e.g., 'Wedding (Close Family)'
 *   - season:   (optional) e.g., 'Summer', 'Winter'
 *   - coverage: (optional) 'Modest' | 'Moderate' | 'Open' — per-request spec
 *               override; when browsing ideas the user may want a different
 *               coverage than their profile default
 *   - style:    (optional) style lane override, same reasoning
 */
exports.getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { occasion, season, coverage, style } = req.query;

    if (!occasion) {
      return res.status(400).json({ error: 'The occasion query parameter is required.' });
    }

    // 1. Fetch current user style profile
    const userResult = await db.query(
      'SELECT height, body_shape, skin_tone, undertone, style_pref, coverage_preference, color_comfort FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const user = userResult.rows[0];

    // 2. Map the occasion to allowed formalities (Hard Filter)
    const allowedFormalities = getAllowedFormalities(occasion);

    // 3. Get blacklisted colors for occasion
    const colorBlacklist = getOccasionColorBlacklist(occasion);

    // 4. Build and execute recommendation query
    const suggestionsQuery = `
      SELECT *,
        (
          CASE WHEN body_types @> ARRAY[$2]::TEXT[] THEN 3 ELSE 0 END +
          CASE WHEN skin_tones @> ARRAY[$3]::TEXT[] THEN 3 ELSE 0 END +
          CASE WHEN (
            ($8 = 'Warm' AND color_palette && ARRAY['Gold', 'Mustard', 'Rust', 'Coral', 'Peach', 'Olive', 'Terracotta', 'Camel', 'Cream']::TEXT[]) OR
            ($8 = 'Cool' AND color_palette && ARRAY['Silver', 'Lavender', 'Navy', 'Emerald', 'Burgundy', 'Ice Blue', 'Plum', 'Wine', 'Cobalt']::TEXT[]) OR
            ($8 = 'Neutral')
          ) THEN 2 ELSE 0 END +
          CASE WHEN style = $4 THEN 2 ELSE 0 END
        ) as match_score
      FROM outfit_catalog
      WHERE 
        $1 = ANY(occasions)
        AND ($6::TEXT[] IS NULL OR formality = ANY($6))
        AND ($7::TEXT IS NULL OR season = $7 OR season = 'All-season')
        AND (
          ($5 = 'Open')
          OR ($5 = 'Moderate' AND coverage IN ('Moderate', 'Conservative'))
          OR ($5 = 'Modest' AND coverage = 'Conservative')
        )
        AND (
          ($9 = 'Bold and Colorful')
          OR ($9 = 'Some Color')
          OR ($9 = 'Neutrals Only' AND color_palette <@ ARRAY[
            'White', 'Black', 'Grey', 'Beige', 'Navy', 'Cream', 'Ivory',
            'Camel', 'Taupe', 'Charcoal', 'Khaki', 'Olive', 'Brown'
          ]::TEXT[])
        )
        AND NOT (color_palette && $10::TEXT[])
      ORDER BY match_score DESC, created_at DESC;
    `;

    const values = [
      occasion,
      user.body_shape || 'Hourglass',
      user.skin_tone || 'Wheatish',
      style || user.style_pref || 'Fusion',
      coverage || user.coverage_preference || 'Moderate',
      allowedFormalities,
      season || null,
      user.undertone || 'Neutral',
      user.color_comfort || 'Some Color',
      colorBlacklist
    ];

    const result = await db.query(suggestionsQuery, values);

    // Optional hard style-lane filter when the user explicitly asked for one
    let rows = result.rows;
    if (style) rows = rows.filter((r) => r.style === style);

    res.status(200).json(rows.map(formatOutfit));

  } catch (err) {
    next(err);
  }
};

/**
 * Closet-first suggestions: complete outfits COMPOSED from the user's own
 * wardrobe items for an occasion, each with a short "why this works" note.
 * Route: GET /suggestions/wardrobe
 * Query parameters:
 *   - occasion: (required)
 *   - season:   (optional)
 *   - coverage: (optional spec override)
 */
exports.getWardrobeSuggestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { occasion, season, coverage } = req.query;

    if (!occasion) {
      return res.status(400).json({ error: 'The occasion query parameter is required.' });
    }

    const [userResult, itemsResult] = await Promise.all([
      db.query(
        'SELECT height, body_shape, skin_tone, undertone, style_pref, coverage_preference, color_comfort FROM users WHERE id = $1',
        [userId]
      ),
      db.query('SELECT * FROM wardrobe_items WHERE user_id = $1', [userId]),
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const outfits = composeOutfits(itemsResult.rows, userResult.rows[0], occasion, {
      season: season || null,
      coverage: coverage || null,
    });

    res.status(200).json({
      occasion,
      wardrobeSize: itemsResult.rows.length,
      outfits: outfits.map((o, idx) => ({
        id: `wardrobe-${idx}`,
        lane: o.lane,
        matchScore: o.score,
        explanation: o.explanation,
        items: o.items, // raw snake_case rows; the client maps with mapWardrobeItem
      })),
    });
  } catch (err) {
    next(err);
  }
};
