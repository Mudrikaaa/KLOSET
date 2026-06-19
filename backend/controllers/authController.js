const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

/**
 * Controller to handle User Registration (Sign Up)
 * Route: POST /auth/signup
 */
exports.signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // 1. Basic validation of inputs
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if a user with this email already exists in the database
    // Running a direct SQL query to maintain visibility and control over DB operations
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // 3. Hash the plain text password using bcrypt
    // bcrypt will generate a secure salt, mix it with the password, and run a cryptographic hash function (blowfish).
    // SALT_ROUNDS dictates how computationally expensive the hashing is, protecting against brute-force attacks.
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Insert the new user into the database
    // We insert default values for style profile fields matching the app's initial state defaults,
    // and flag that the user has not seen onboarding by setting style preferences to defaults,
    // which can be customized later in onboarding (/users/me PUT).
    const insertQuery = `
      INSERT INTO users (
        email, 
        password_hash, 
        name, 
        height, 
        body_shape, 
        skin_tone, 
        undertone, 
        style_pref, 
        coverage_preference, 
        occasion_frequency, 
        color_comfort
      ) 
      VALUES ($1, $2, $3, 'Average', 'Hourglass', 'Wheatish', 'Neutral', 'Fusion', 'Moderate', 'Mix of Everything', 'Some Color') 
      RETURNING id, email, name, height, body_shape, skin_tone, undertone, style_pref, coverage_preference, occasion_frequency, color_comfort, created_at;
    `;

    const result = await db.query(insertQuery, [normalizedEmail, passwordHash, name]);
    const newUser = result.rows[0];

    // 5. Generate a JSON Web Token (JWT)
    // We encode the user's ID and Email inside the token payload.
    // The client will store this token and send it in the 'Authorization' header for protected routes.
    const tokenPayload = { id: newUser.id, email: newUser.email };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // 6. Return the registered user profile (omitting password_hash) and the JWT token
    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        height: newUser.height,
        bodyShape: newUser.body_shape, // match camelCase styling matching frontend store
        skinTone: newUser.skin_tone,
        undertone: newUser.undertone,
        stylePreference: newUser.style_pref,
        coveragePreference: newUser.coverage_preference,
        occasionFrequency: newUser.occasion_frequency,
        colorComfort: newUser.color_comfort,
        createdAt: newUser.created_at
      },
      token
    });

  } catch (err) {
    // Pass execution to the global Express error handler
    next(err);
  }
};

/**
 * Controller to handle User Authentication (Login)
 * Route: POST /auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation of inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Query the user by email including their password hash
    const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // 3. Verify the password hash matches the user's input password
    // bcrypt.compare() hashes the input password using the salt stored within user.password_hash and compares them.
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Generate a JWT token
    const tokenPayload = { id: user.id, email: user.email };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // 5. Return the authenticated user profile and the token
    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        height: user.height,
        bodyShape: user.body_shape, // camelCase properties to align with Zustand store
        skinTone: user.skin_tone,
        undertone: user.undertone,
        stylePreference: user.style_pref,
        coveragePreference: user.coverage_preference,
        occasionFrequency: user.occasion_frequency,
        colorComfort: user.color_comfort,
        createdAt: user.created_at
      },
      token
    });

  } catch (err) {
    next(err);
  }
};
