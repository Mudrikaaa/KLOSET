const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for registering a new user
// POST /auth/signup
router.post('/signup', authController.signup);

// Route for logging in an existing user
// POST /auth/login
router.post('/login', authController.login);

module.exports = router;
