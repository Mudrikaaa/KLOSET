const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const db = require('../config/db');
const { analyzeGarmentImage } = require('../services/visionService');
const { extractGarments } = require('../services/garmentExtractor');
const { defaultSectionFor } = require('./sectionController');

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Utility helper to parse array parameters sent in multipart/form-data.
 * Multipart fields may arrive as JSON-stringified arrays (e.g. '["Casual", "Brunch"]')
 * or comma-separated strings (e.g. 'Casual, Brunch').
 */
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  
  if (typeof field === 'string') {
    // Check if it looks like a stringified JSON array
    if (field.startsWith('[') && field.endsWith(']')) {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).trim());
        }
      } catch (e) {
        // Fall back to splitting by comma if JSON parsing fails
      }
    }
    return field.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [String(field)];
};

/**
 * Helper to upload a buffer stream to Cloudinary
 */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // Cloudinary's upload_stream allows uploading binary buffer streams directly
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'kloset_wardrobe' },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Upload stream error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    // Write buffer into the writable stream and end it
    uploadStream.end(fileBuffer);
  });
};

/**
 * Analyze a garment photo with the vision service and return pre-fill values
 * for the upload form.
 * Route: POST /wardrobe/analyze
 * Format: multipart/form-data (contains only the 'image' file)
 *
 * why always 200 with detected:null instead of an error status: auto-detection
 * is a convenience layer. The client treats any failure as "fill the form
 * manually" — an error status would wrongly surface as a broken upload flow.
 */
exports.analyzeWardrobeItem = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'An image file is required for analysis.' });
    }

    const result = await analyzeGarmentImage(req.file.buffer, req.file.mimetype);
    res.status(200).json(result);
  } catch (err) {
    // Defensive: the service already swallows its own failures, but never let
    // an unexpected throw block the upload flow either.
    console.error('[Wardrobe] Unexpected analyze error:', err);
    res.status(200).json({ detected: null, lowConfidence: ['fabric', 'season', 'occasions'] });
  }
};

/** Shared INSERT for wardrobe rows (primary and split-off items alike). */
const insertWardrobeRow = async (fields) => {
  const insertQuery = `
    INSERT INTO wardrobe_items (
      user_id, image_url, category, color, colors, style, fit, fabric, length, pattern,
      neckline, sleeve, season, occasions, tags, sub_type, waist_position, structure,
      embellishment, opacity, section_id, cutout_url, source_group_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    RETURNING *;
  `;
  const result = await db.query(insertQuery, [
    fields.userId, fields.imageUrl, fields.category, fields.color, fields.colors,
    fields.style, fields.fit, fields.fabric, fields.length, fields.pattern,
    fields.neckline, fields.sleeve, fields.season, fields.occasions, fields.tags,
    fields.subType, fields.waistPosition, fields.structure, fields.embellishment,
    fields.opacity, fields.sectionId, fields.cutoutUrl, fields.sourceGroupId,
  ]);
  return result.rows[0];
};

/**
 * Add a new wardrobe item.
 * Route: POST /wardrobe
 * Format: multipart/form-data ('image' file + text fields)
 *
 * One upload can create one OR two rows: a worn photo of genuinely separate
 * top + bottom garments is split by the extraction pipeline; self-contained
 * sets (saree, lehenga, sharara, anarkali, gown, co-ord) never split.
 * Extraction is best-effort by contract — any ML failure still saves the
 * original photo with the user's manual entry.
 *
 * Response: { message, item, items } — `item` is the primary row (backwards
 * compatible), `items` is everything this upload created.
 */
exports.addWardrobeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      category, color, colors, style, fit, fabric, length, pattern, neckline,
      sleeve, season, occasions, tags, subType, waistPosition, structure,
      embellishment, opacity, sectionId,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'An image file is required to add a wardrobe item.' });
    }
    if (!category || !style) {
      return res.status(400).json({ error: 'Category and style are required fields.' });
    }

    // 1. The original photo always uploads first — it is the save's anchor;
    // everything after this point is enhancement and may silently fail.
    console.log('[Wardrobe] Uploading image buffer to Cloudinary...');
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const imageUrl = uploadResult.secure_url;
    console.log('[Wardrobe] Image uploaded. Cloudinary URL:', imageUrl);

    // 2. Resolve the destination shelf/drawer (validate a user-supplied one;
    // otherwise category decides: shoes/accessories -> drawer, else shelf)
    let resolvedSectionId = null;
    if (sectionId) {
      const owned = await db.query(
        'SELECT id FROM closet_sections WHERE id = $1 AND user_id = $2',
        [sectionId, userId]
      );
      if (owned.rows.length > 0) resolvedSectionId = sectionId;
    }
    if (!resolvedSectionId) {
      resolvedSectionId = await defaultSectionFor(userId, category);
    }

    // 3. Garment extraction (rembg / SegFormer via ml-service + Gemini
    // classification). Never throws; empty cutouts on any failure.
    const extraction = await extractGarments(req.file.buffer, req.file.mimetype, {
      category, subType: subType || null,
    });

    // 4. Upload whatever cutouts we got (each is a transparent PNG)
    const cutoutUrls = {};
    for (const c of extraction.cutouts) {
      try {
        const up = await uploadToCloudinary(c.buffer);
        cutoutUrls[c.role] = up.secure_url;
      } catch (err) {
        console.warn('[Wardrobe] Cutout upload failed (continuing):', err.message);
      }
    }

    const isSplit = !!(cutoutUrls.top && cutoutUrls.bottom);
    const sourceGroupId = isSplit ? crypto.randomUUID() : null;

    let parsedColors = parseArrayField(colors);
    if (parsedColors.length === 0 && color) parsedColors = [color];

    // 5. Primary row = the user's confirmed form data
    const primary = await insertWardrobeRow({
      userId,
      imageUrl,
      category,
      color: parsedColors[0] || 'White',
      colors: parsedColors,
      style,
      fit: fit || 'Regular',
      fabric: fabric || 'Cotton',
      length: length || 'Not Applicable',
      pattern: pattern || 'Solid',
      neckline: neckline || 'Not Applicable',
      sleeve: sleeve || 'Not Applicable',
      season: season || 'All-season',
      occasions: parseArrayField(occasions),
      tags: parseArrayField(tags),
      subType: subType || null,
      waistPosition: waistPosition || null,
      structure: structure || null,
      embellishment: embellishment || null,
      opacity: opacity || null,
      sectionId: resolvedSectionId,
      cutoutUrl: isSplit ? cutoutUrls.top : (cutoutUrls.single || null),
      sourceGroupId,
    });

    const items = [primary];

    // 6. Split path: the bottom garment becomes its own row. Its attributes
    // come from running the existing vision analysis on the bottom CUTOUT
    // (so colours/fabric describe the actual garment, not the whole photo);
    // if that fails we fall back to the classifier's category guess with
    // neutral defaults the user can edit. Tagged 'auto-split' so the UI can
    // surface "review me" later.
    if (isSplit) {
      const cutoutBuffer = extraction.cutouts.find((c) => c.role === 'bottom').buffer;
      let detected = null;
      try {
        const analysis = await analyzeGarmentImage(cutoutBuffer, 'image/png');
        detected = analysis.detected;
      } catch (e) { /* fall through to defaults */ }

      const lowerCategory =
        (detected && ['Bottoms', 'Ethnic Bottoms'].includes(detected.category) && detected.category) ||
        (extraction.lowerGarment && extraction.lowerGarment.category) || 'Bottoms';
      const lowerColors = (detected && detected.colors && detected.colors.length) ? detected.colors : ['Grey'];

      const secondary = await insertWardrobeRow({
        userId,
        imageUrl, // both halves share the original photo
        category: lowerCategory,
        color: lowerColors[0],
        colors: lowerColors,
        style: (detected && detected.style) || style,
        fit: (detected && detected.fit) || 'Regular',
        fabric: (detected && detected.fabric) || 'Cotton',
        length: (detected && detected.length) || 'Full',
        pattern: (detected && detected.pattern) || 'Solid',
        neckline: 'Not Applicable',
        sleeve: 'Not Applicable',
        season: (detected && detected.season) || season || 'All-season',
        occasions: parseArrayField(occasions),
        tags: ['auto-split'],
        subType: (detected && detected.subType) || (extraction.lowerGarment && extraction.lowerGarment.subType) || null,
        waistPosition: null,
        structure: (detected && detected.structure) || null,
        embellishment: (detected && detected.embellishment) || null,
        opacity: (detected && detected.opacity) || null,
        sectionId: await defaultSectionFor(userId, lowerCategory),
        cutoutUrl: cutoutUrls.bottom,
        sourceGroupId,
      });
      items.push(secondary);
      console.log('[Wardrobe] Split upload -> 2 items:', primary.id, secondary.id);
    }

    res.status(201).json({
      message: isSplit
        ? 'Two garments detected and saved from your photo!'
        : 'Wardrobe item added successfully!',
      item: primary,
      items,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Move an item to a different shelf/drawer.
 * Route: PUT /wardrobe/:id/section  { sectionId }
 */
exports.moveItemSection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sectionId } = req.body;
    if (!sectionId) return res.status(400).json({ error: 'sectionId is required.' });

    const owned = await db.query(
      'SELECT id FROM closet_sections WHERE id = $1 AND user_id = $2',
      [sectionId, userId]
    );
    if (owned.rows.length === 0) return res.status(404).json({ error: 'Section not found.' });

    const result = await db.query(
      'UPDATE wardrobe_items SET section_id = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [sectionId, req.params.id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Wardrobe item not found.' });

    res.status(200).json({ message: 'Item moved.', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * List all wardrobe items belonging to the current user
 * Route: GET /wardrobe
 */
exports.listWardrobeItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM wardrobe_items 
      WHERE user_id = $1 
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [userId]);

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a wardrobe item
 * Route: PUT /wardrobe/:id
 */
exports.updateWardrobeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const {
      category,
      color,
      colors,
      style,
      fit,
      fabric,
      length,
      pattern,
      neckline,
      sleeve,
      season,
      occasions,
      tags,
      subType,
      waistPosition,
      structure,
      embellishment,
      opacity
    } = req.body;

    // Verify item ownership before updating
    const checkResult = await db.query(
      'SELECT id FROM wardrobe_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wardrobe item not found or unauthorized.' });
    }

    // Parse arrays if provided
    let parsedColors = colors ? parseArrayField(colors) : null;
    let primaryColor = null;
    if (parsedColors && parsedColors.length > 0) {
      primaryColor = parsedColors[0];
    } else if (color) {
      primaryColor = color;
      parsedColors = [color];
    }

    const parsedOccasions = occasions ? parseArrayField(occasions) : null;
    const parsedTags = tags ? parseArrayField(tags) : null;

    const updateQuery = `
      UPDATE wardrobe_items
      SET
        category = COALESCE($1, category),
        color = COALESCE($2, color),
        colors = COALESCE($3, colors),
        style = COALESCE($4, style),
        fit = COALESCE($5, fit),
        fabric = COALESCE($6, fabric),
        length = COALESCE($7, length),
        pattern = COALESCE($8, pattern),
        neckline = COALESCE($9, neckline),
        sleeve = COALESCE($10, sleeve),
        season = COALESCE($11, season),
        occasions = COALESCE($12, occasions),
        tags = COALESCE($13, tags),
        sub_type = COALESCE($14, sub_type),
        waist_position = COALESCE($15, waist_position),
        structure = COALESCE($16, structure),
        embellishment = COALESCE($17, embellishment),
        opacity = COALESCE($18, opacity)
      WHERE id = $19 AND user_id = $20
      RETURNING *;
    `;

    const values = [
      category || null,
      primaryColor || null,
      parsedColors || null,
      style || null,
      fit || null,
      fabric || null,
      length || null,
      pattern || null,
      neckline || null,
      sleeve || null,
      season || null,
      parsedOccasions || null,
      parsedTags || null,
      subType || null,
      waistPosition || null,
      structure || null,
      embellishment || null,
      opacity || null,
      itemId,
      userId
    ];

    const result = await db.query(updateQuery, values);
    res.status(200).json({
      message: 'Wardrobe item updated successfully!',
      item: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Delete a wardrobe item
 * Route: DELETE /wardrobe/:id
 */
exports.deleteWardrobeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    // Delete item if it matches the id and user_id ownership
    const deleteQuery = `
      DELETE FROM wardrobe_items 
      WHERE id = $1 AND user_id = $2 
      RETURNING *;
    `;
    const result = await db.query(deleteQuery, [itemId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wardrobe item not found or unauthorized.' });
    }

    res.status(200).json({
      message: 'Wardrobe item deleted successfully!',
      item: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};
