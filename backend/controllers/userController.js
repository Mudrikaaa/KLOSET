const db = require('../config/db');

/**
 * Helper to map database user row to frontend profile JSON structure
 */
const formatProfile = (userRow) => {
  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    height: userRow.height,
    bodyShape: userRow.body_shape,
    skinTone: userRow.skin_tone,
    undertone: userRow.undertone,
    stylePreference: userRow.style_pref,
    coveragePreference: userRow.coverage_preference,
    occasionFrequency: userRow.occasion_frequency,
    colorComfort: userRow.color_comfort,
    createdAt: userRow.created_at
  };
};

/**
 * Fetch the logged-in user's profile info
 * Route: GET /users/me
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // populated by authenticateToken middleware

    const result = await db.query(
      'SELECT id, email, name, height, body_shape, skin_tone, undertone, style_pref, coverage_preference, occasion_frequency, color_comfort, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.status(200).json(formatProfile(result.rows[0]));
  } catch (err) {
    next(err);
  }
};

/**
 * Update the logged-in user's style preferences / onboarding profile
 * Route: PUT /users/me
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      height,
      bodyShape,
      skinTone,
      undertone,
      stylePreference,
      coveragePreference,
      occasionFrequency,
      colorComfort
    } = req.body;

    // Build standard Postgres direct SQL query for update
    const updateQuery = `
      UPDATE users
      SET 
        name = COALESCE($1, name),
        height = COALESCE($2, height),
        body_shape = COALESCE($3, body_shape),
        skin_tone = COALESCE($4, skin_tone),
        undertone = COALESCE($5, undertone),
        style_pref = COALESCE($6, style_pref),
        coverage_preference = COALESCE($7, coverage_preference),
        occasion_frequency = COALESCE($8, occasion_frequency),
        color_comfort = COALESCE($9, color_comfort)
      WHERE id = $10
      RETURNING id, email, name, height, body_shape, skin_tone, undertone, style_pref, coverage_preference, occasion_frequency, color_comfort, created_at;
    `;

    const values = [
      name,
      height,
      bodyShape,
      skinTone,
      undertone,
      stylePreference, // map stylePreference to style_pref
      coveragePreference,
      occasionFrequency,
      colorComfort,
      userId
    ];

    const result = await db.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: formatProfile(result.rows[0])
    });

  } catch (err) {
    next(err);
  }
};
