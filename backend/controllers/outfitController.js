const db = require('../config/db');

/**
 * Occasion-to-Formality Mapping
 * Prevents casual outfits from being suggested for formal/festive events.
 */
const occasionToFormality = {
  // Festive & Family
  'Diwali Party (Family)': ['Festive', 'Semi-formal'],
  'Diwali Party (Friends)': ['Festive', 'Party', 'Smart Casual'],
  'Holi': ['Casual'],
  'Navratri / Garba': ['Festive', 'Party'],
  'Eid': ['Festive', 'Semi-formal', 'Formal'],
  'Regional Festival': ['Festive', 'Semi-formal'],
  'Pooja / Temple Visit': ['Festive', 'Semi-formal'],

  // Weddings
  'Mehendi Function': ['Festive', 'Party'],
  'Sangeet Night': ['Party', 'Festive'],
  'Wedding (Close Family)': ['Formal', 'Festive'],
  'Wedding (Guest)': ['Festive', 'Semi-formal'],
  'Reception': ['Formal', 'Party'],
  'Cocktail / Pre-wedding': ['Party', 'Semi-formal'],
  'Engagement Ceremony': ['Semi-formal', 'Festive'],
  'Roka / Sagai': ['Semi-formal', 'Festive'],

  // College
  'First Day of College': ['Smart Casual', 'Casual'],
  'College Farewell': ['Semi-formal', 'Smart Casual'],
  'College Fest (Day)': ['Casual', 'Smart Casual'],
  'College Fest (Night)': ['Party', 'Smart Casual'],
  'College Trip': ['Casual'],
  'Internship (Startup)': ['Smart Casual', 'Casual'],
  'Internship (Corporate)': ['Smart Casual', 'Semi-formal'],

  // Professional
  'Job Interview (Tech)': ['Smart Casual', 'Semi-formal'],
  'Job Interview (Corporate)': ['Formal', 'Semi-formal'],
  'Office (Startup)': ['Smart Casual', 'Casual'],
  'Office (Formal)': ['Formal', 'Semi-formal'],
  'Client Meeting': ['Semi-formal', 'Formal'],

  // Social
  'Casual Outing': ['Casual', 'Smart Casual'],
  'Mall / Shopping Day': ['Casual', 'Smart Casual'],
  'Brunch / Cafe': ['Smart Casual', 'Casual'],
  'Dinner Date': ['Smart Casual', 'Semi-formal'],
  'First Date': ['Smart Casual', 'Semi-formal'],
  'Night Out': ['Party', 'Smart Casual'],
  'House Party': ['Smart Casual', 'Casual', 'Party'],

  // Special
  'My Birthday': ['Party', 'Smart Casual', 'Festive'],
  "Friend's Birthday": ['Party', 'Smart Casual'],
  'Travel Day': ['Casual'],
  'Airport / Travel Look': ['Smart Casual', 'Casual'],
  'Gym / Workout': ['Casual'],
  'Beach / Pool Day': ['Casual'],
  'WFH / Video Call': ['Smart Casual', 'Casual'],
  'Anniversary Dinner': ['Semi-formal', 'Formal'],
  'Baby Shower / Godh Bharai': ['Festive', 'Smart Casual'],
};

/**
 * Helper to determine allowed formalities based on occasion.
 * Includes fuzzy matching to support dynamic occasion inputs.
 */
const getAllowedFormalities = (occasion) => {
  if (!occasion) return null;
  const occLower = occasion.toLowerCase();

  // Exact matching check
  for (const [key, val] of Object.entries(occasionToFormality)) {
    if (key.toLowerCase() === occLower) {
      return val;
    }
  }

  // Fuzzy substring matches
  if (occLower.includes('wedding') || occLower.includes('cocktail') || occLower.includes('marriage')) {
    return ['Formal', 'Festive', 'Party'];
  }
  if (occLower.includes('party') || occLower.includes('night') || occLower.includes('dinner')) {
    return ['Festive', 'Party', 'Smart Casual'];
  }
  if (occLower.includes('office') || occLower.includes('work') || occLower.includes('interview')) {
    return ['Smart Casual', 'Semi-formal', 'Formal'];
  }
  if (occLower.includes('festival') || occLower.includes('diwali') || occLower.includes('pooja') || occLower.includes('eid')) {
    return ['Festive', 'Formal', 'Semi-formal'];
  }

  // Default fallback
  return ['Casual', 'Smart Casual'];
};

/**
 * Returns colors that should be AVOIDED for this occasion in Indian cultural context.
 */
const getOccasionColorBlacklist = (occasion) => {
  const occLower = (occasion || '').toLowerCase();

  if (occLower.includes('wedding') && !occLower.includes('cocktail')) {
    // Don't suggest red/scarlet/crimson to wedding guests — it's traditionally the bride's color
    return ['Red', 'Scarlet', 'Crimson'];
  }
  if (occLower.includes('pooja') || occLower.includes('temple')) {
    // Avoid black for religious occasions
    return ['Black'];
  }
  return [];
};

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
 * Route: GET /suggestions
 * Query parameters:
 *   - occasion: (required) e.g., 'Wedding (Close Family)'
 *   - season: (optional) e.g., 'Summer', 'Winter'
 */
exports.getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { occasion, season } = req.query;

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
      user.style_pref || 'Fusion',
      user.coverage_preference || 'Moderate',
      allowedFormalities,
      season || null,
      user.undertone || 'Neutral',
      user.color_comfort || 'Some Color',
      colorBlacklist
    ];

    const result = await db.query(suggestionsQuery, values);

    // 5. Return matching outfits, formatted correctly
    res.status(200).json(result.rows.map(formatOutfit));

  } catch (err) {
    next(err);
  }
};
