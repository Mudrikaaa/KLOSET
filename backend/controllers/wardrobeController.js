const cloudinary = require('cloudinary').v2;
const db = require('../config/db');
const { analyzeGarmentImage } = require('../services/visionService');

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

/**
 * Add a new wardrobe item
 * Route: POST /wardrobe
 * Format: multipart/form-data (contains 'image' file and text body fields)
 */
exports.addWardrobeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
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

    // 1. Ensure an image file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'An image file is required to add a wardrobe item.' });
    }

    if (!category || !style) {
      return res.status(400).json({ error: 'Category and style are required fields.' });
    }

    // 2. Upload the file buffer to Cloudinary
    console.log('[Wardrobe] Uploading image buffer to Cloudinary...');
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const imageUrl = uploadResult.secure_url;
    console.log('[Wardrobe] Image uploaded. Cloudinary URL:', imageUrl);

    // 3. Parse occasions, tags, and colors arrays
    let parsedColors = parseArrayField(colors);
    if (parsedColors.length === 0 && color) {
      parsedColors = [color];
    }
    const primaryColor = parsedColors[0] || 'White';

    const parsedOccasions = parseArrayField(occasions);
    const parsedTags = parseArrayField(tags);

    // 4. Insert wardrobe item record into PostgreSQL database
    const insertQuery = `
      INSERT INTO wardrobe_items (
        user_id, image_url, category, color, colors, style, fit, fabric, length, pattern, neckline, sleeve, season, occasions, tags, sub_type, waist_position, structure, embellishment, opacity
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *;
    `;

    const values = [
      userId,
      imageUrl,
      category,
      primaryColor,
      parsedColors,
      style,
      fit || 'Regular',
      fabric || 'Cotton',
      length || 'Not Applicable',
      pattern || 'Solid',
      neckline || 'Not Applicable',
      sleeve || 'Not Applicable',
      season || 'All-season',
      parsedOccasions,
      parsedTags,
      subType || null,
      waistPosition || null,
      structure || null,
      embellishment || null,
      opacity || null
    ];

    const result = await db.query(insertQuery, values);
    const newItem = result.rows[0];

    res.status(201).json({
      message: 'Wardrobe item added successfully!',
      item: newItem
    });

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
