const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

// Fetch user profile
// GET /users/me
router.get('/me', authenticateToken, userController.getProfile);

// Update user profile / onboarding preference
// PUT /users/me
router.put('/me', authenticateToken, userController.updateProfile);

module.exports = router;
