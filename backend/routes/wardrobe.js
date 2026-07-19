const express = require('express');
const router = express.Router();
const multer = require('multer');
const wardrobeController = require('../controllers/wardrobeController');
const authenticateToken = require('../middleware/authMiddleware');

// Set up Multer for handling file uploads
// Using memory storage because we will upload the file buffer directly to Cloudinary
// without saving raw files to the server's filesystem.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Restrict files to images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// GET /wardrobe - List all wardrobe items of current user
router.get('/', authenticateToken, wardrobeController.listWardrobeItems);

// POST /wardrobe - Add a new wardrobe item with an image file upload
// The field name for the image file must be 'image'
router.post('/', authenticateToken, upload.single('image'), wardrobeController.addWardrobeItem);

// POST /wardrobe/analyze - AI auto-detection: returns pre-fill values for the
// upload form from a garment photo. Never blocks a save — on any AI failure it
// responds 200 with { detected: null } and the user fills the form manually.
router.post('/analyze', authenticateToken, upload.single('image'), wardrobeController.analyzeWardrobeItem);

// PUT /wardrobe/:id/section - Move an item to another shelf/drawer
router.put('/:id/section', authenticateToken, wardrobeController.moveItemSection);

// PUT /wardrobe/:id - Update an existing wardrobe item's details
router.put('/:id', authenticateToken, wardrobeController.updateWardrobeItem);

// DELETE /wardrobe/:id - Delete a wardrobe item
router.delete('/:id', authenticateToken, wardrobeController.deleteWardrobeItem);

module.exports = router;
