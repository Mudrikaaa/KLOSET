const db = require('../config/db');

// ============================================================================
// Closet sections — shelves (hanging) and drawers (folded / non-hanging:
// footwear, accessories, bags, anything). Every wardrobe item lives in one.
// ============================================================================

const formatSection = (row) => ({
  id: row.id,
  name: row.name,
  kind: row.kind,
  position: row.position,
  itemCount: row.item_count !== undefined ? parseInt(row.item_count, 10) : undefined,
  createdAt: row.created_at,
});

/**
 * Lazily create a user's starter sections.
 * why lazy (not at signup): existing accounts predate this feature, and a
 * migration can't seed rows for users who don't exist yet — so the first
 * closet read guarantees the invariant "every user has ≥1 shelf and ≥1 drawer".
 */
const ensureDefaults = async (userId) => {
  const { rows } = await db.query(
    'SELECT * FROM closet_sections WHERE user_id = $1 ORDER BY position, created_at',
    [userId]
  );
  if (rows.some((r) => r.kind === 'shelf') && rows.some((r) => r.kind === 'drawer')) return rows;

  if (!rows.some((r) => r.kind === 'shelf')) {
    await db.query(
      "INSERT INTO closet_sections (user_id, name, kind, position) VALUES ($1, 'Shelf 1', 'shelf', 0)",
      [userId]
    );
  }
  if (!rows.some((r) => r.kind === 'drawer')) {
    await db.query(
      "INSERT INTO closet_sections (user_id, name, kind, position) VALUES ($1, 'Drawer 1', 'drawer', 100)",
      [userId]
    );
  }
  const refreshed = await db.query(
    'SELECT * FROM closet_sections WHERE user_id = $1 ORDER BY position, created_at',
    [userId]
  );
  return refreshed.rows;
};

/**
 * Where does a new item live when the user didn't choose?
 * why: shoes/accessories/bags don't hang — a stylist puts them in a drawer by
 * reflex, so the app does too. Everything else defaults to the first shelf.
 */
const defaultSectionFor = async (userId, category) => {
  const sections = await ensureDefaults(userId);
  const wantsDrawer = ['Shoes', 'Accessories'].includes(category);
  const preferred = sections.find((s) => s.kind === (wantsDrawer ? 'drawer' : 'shelf'));
  return preferred ? preferred.id : sections[0].id;
};

/** GET /sections — ordered, with live item counts */
exports.listSections = async (req, res, next) => {
  try {
    await ensureDefaults(req.user.id);
    const { rows } = await db.query(
      `SELECT s.*, COUNT(w.id) AS item_count
       FROM closet_sections s
       LEFT JOIN wardrobe_items w ON w.section_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.position, s.created_at`,
      [req.user.id]
    );
    res.status(200).json(rows.map(formatSection));
  } catch (err) {
    next(err);
  }
};

/** POST /sections { name, kind } */
exports.createSection = async (req, res, next) => {
  try {
    const { name, kind } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Section name is required.' });
    if (!['shelf', 'drawer'].includes(kind)) return res.status(400).json({ error: "kind must be 'shelf' or 'drawer'." });

    const { rows } = await db.query(
      `INSERT INTO closet_sections (user_id, name, kind, position)
       VALUES ($1, $2, $3, COALESCE((SELECT MAX(position) + 1 FROM closet_sections WHERE user_id = $1), 0))
       RETURNING *`,
      [req.user.id, name.trim().slice(0, 60), kind]
    );
    res.status(201).json(formatSection(rows[0]));
  } catch (err) {
    next(err);
  }
};

/** PUT /sections/reorder { orderedIds: [...] } — positions follow array order */
exports.reorderSections = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: 'orderedIds array is required.' });
    }
    // Single statement; the user_id predicate makes foreign ids a silent no-op
    await db.query(
      `UPDATE closet_sections s SET position = o.ord
       FROM (SELECT unnest($2::uuid[]) AS id, generate_series(0, $3::int - 1) AS ord) o
       WHERE s.id = o.id AND s.user_id = $1`,
      [req.user.id, orderedIds, orderedIds.length]
    );
    const { rows } = await db.query(
      'SELECT * FROM closet_sections WHERE user_id = $1 ORDER BY position, created_at',
      [req.user.id]
    );
    res.status(200).json(rows.map(formatSection));
  } catch (err) {
    next(err);
  }
};

/** PUT /sections/:id { name } — rename */
exports.renameSection = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Section name is required.' });
    const { rows } = await db.query(
      'UPDATE closet_sections SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [name.trim().slice(0, 60), req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Section not found.' });
    res.status(200).json(formatSection(rows[0]));
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /sections/:id — items are never orphaned: they move to another
 * section of the same kind (created on the fly if this was the last one).
 */
exports.deleteSection = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM closet_sections WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Section not found.' });
    const section = rows[0];

    let fallback = (await db.query(
      'SELECT id FROM closet_sections WHERE user_id = $1 AND kind = $2 AND id != $3 ORDER BY position LIMIT 1',
      [req.user.id, section.kind, section.id]
    )).rows[0];
    if (!fallback) {
      fallback = (await db.query(
        "INSERT INTO closet_sections (user_id, name, kind, position) VALUES ($1, $2, $3, 0) RETURNING id",
        [req.user.id, section.kind === 'shelf' ? 'Shelf 1' : 'Drawer 1', section.kind]
      )).rows[0];
    }

    await db.query('UPDATE wardrobe_items SET section_id = $1 WHERE section_id = $2', [fallback.id, section.id]);
    await db.query('DELETE FROM closet_sections WHERE id = $1', [section.id]);
    res.status(200).json({ deleted: section.id, itemsMovedTo: fallback.id });
  } catch (err) {
    next(err);
  }
};

exports.ensureDefaults = ensureDefaults;
exports.defaultSectionFor = defaultSectionFor;
