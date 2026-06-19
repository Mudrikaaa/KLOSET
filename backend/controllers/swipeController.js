const db = require('../config/db');

/**
 * Record a swipe (like/dislike) on an outfit.
 * Route: POST /swipes
 * Body: { outfitId: 'UUID', direction: 'like' | 'dislike' }
 */
exports.recordSwipe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { outfitId, direction } = req.body;

    // 1. Validate inputs
    if (!outfitId || !direction) {
      return res.status(400).json({ error: 'outfitId and direction are required.' });
    }

    if (direction !== 'like' && direction !== 'dislike') {
      return res.status(400).json({ error: "direction must be either 'like' or 'dislike'." });
    }

    // 2. Verify outfit exists before recording swipe
    const outfitCheck = await db.query('SELECT id FROM outfit_catalog WHERE id = $1', [outfitId]);
    if (outfitCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Outfit catalog item not found.' });
    }

    // 3. Upsert the swipe
    // Using ON CONFLICT to gracefully update swipe direction if the user swipes on the same outfit again
    const upsertQuery = `
      INSERT INTO swipes (user_id, outfit_id, direction)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, outfit_id)
      DO UPDATE SET 
        direction = EXCLUDED.direction,
        swiped_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await db.query(upsertQuery, [userId, outfitId, direction]);
    const swipeRecord = result.rows[0];

    res.status(201).json({
      message: 'Swipe recorded successfully!',
      swipe: {
        id: swipeRecord.id,
        userId: swipeRecord.user_id,
        outfitId: swipeRecord.outfit_id,
        direction: swipeRecord.direction,
        swipedAt: swipeRecord.swiped_at
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve swipe history for the logged-in user, joined with outfit catalog metadata.
 * Route: GET /swipes
 */
exports.getSwipeHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Join with outfit_catalog to fetch outfit titles and images for history display
    const query = `
      SELECT 
        s.id, 
        s.direction, 
        s.swiped_at, 
        o.id as outfit_id, 
        o.title as outfit_title, 
        o.image_url as outfit_image_url,
        o.style as outfit_style
      FROM swipes s
      JOIN outfit_catalog o ON s.outfit_id = o.id
      WHERE s.user_id = $1
      ORDER BY s.swiped_at DESC;
    `;

    const result = await db.query(query, [userId]);

    const formattedHistory = result.rows.map(row => ({
      id: row.id,
      direction: row.direction,
      swipedAt: row.swiped_at,
      outfit: {
        id: row.outfit_id,
        title: row.outfit_title,
        imageUrl: row.outfit_image_url,
        style: row.outfit_style
      }
    }));

    res.status(200).json(formattedHistory);

  } catch (err) {
    next(err);
  }
};
