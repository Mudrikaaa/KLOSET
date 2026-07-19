const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const authenticateToken = require('../middleware/authMiddleware');

// GET /sections - list the user's shelves & drawers (creates defaults lazily)
router.get('/', authenticateToken, sectionController.listSections);

// POST /sections - create a shelf or drawer { name, kind }
router.post('/', authenticateToken, sectionController.createSection);

// PUT /sections/reorder - registered BEFORE /:id so 'reorder' isn't captured
// as an id parameter
router.put('/reorder', authenticateToken, sectionController.reorderSections);

// PUT /sections/:id - rename { name }
router.put('/:id', authenticateToken, sectionController.renameSection);

// DELETE /sections/:id - delete; its items move to a sibling of the same kind
router.delete('/:id', authenticateToken, sectionController.deleteSection);

module.exports = router;
