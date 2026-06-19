const express = require('express');
const router = express.Router();
const outfitController = require('../controllers/outfitController');
const authenticateToken = require('../middleware/authMiddleware');

// Fetch customized outfit recommendations / suggestions
// GET /outfits/suggestions -> Wait, the user requested: GET /suggestions?occasion=X
// In Express, we can map this route directly at the /suggestions or /outfits/suggestions prefix.
// The user request specified: GET /suggestions?occasion=X
// Let's implement it on GET /outfits/suggestions, but since the user requested "GET /suggestions?occasion=X",
// we can register it under routes/outfits.js or directly in server.js.
// Let's register it inside routes/outfits.js as GET /suggestions (if routes/outfits.js is mounted on /outfits) 
// or register it as GET /suggestions in server.js directly.
// To keep things clean, let's export it here and mount it on /suggestions or /outfits/suggestions.
// Let's register it here as GET /suggestions and mount routes/outfits.js at /outfits, but ALSO register a separate suggestions router or mount this suggestions route directly in server.js!
// In routes/outfits.js:
// router.get('/suggestions', authenticateToken, outfitController.getSuggestions); // mapped as GET /outfits/suggestions
// We can also support GET /suggestions in server.js mapped to outfitController.getSuggestions. That is perfect!
// Let's add GET /suggestions here to keep it inside outfits router, and in server.js we can redirect/mount appropriately!

// GET /outfits - List all outfits
router.get('/', authenticateToken, outfitController.getAllOutfits);

// GET /outfits/suggestions - Suggestions mapping (available here as well)
router.get('/suggestions', authenticateToken, outfitController.getSuggestions);

// GET /outfits/:id - Fetch a single outfit details
router.get('/:id', authenticateToken, outfitController.getOutfitById);

module.exports = router;
