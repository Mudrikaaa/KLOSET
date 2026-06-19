const express = require('express');
const router = express.Router();
const swipeController = require('../controllers/swipeController');
const authenticateToken = require('../middleware/authMiddleware');

// Record a new swipe (like or dislike) on an outfit
// POST /swipes
router.post('/', authenticateToken, swipeController.recordSwipe);

// Retrieve swipe history for current user
// GET /swipes
router.get('/', authenticateToken, swipeController.getSwipeHistory);

module.exports = router;
