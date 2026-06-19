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

// PUT /wardrobe/:id - Update an existing wardrobe item's details
router.put('/:id', authenticateToken, wardrobeController.updateWardrobeItem);

// DELETE /wardrobe/:id - Delete a wardrobe item
router.delete('/:id', authenticateToken, wardrobeController.deleteWardrobeItem);

module.exports = router;
