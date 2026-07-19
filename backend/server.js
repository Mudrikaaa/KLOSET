const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const wardrobeRoutes = require('./routes/wardrobe');
const outfitRoutes = require('./routes/outfits');
const swipeRoutes = require('./routes/swipes');
const sectionRoutes = require('./routes/sections');

// We import the suggestions controller directly to mount /suggestions on the root path
const outfitController = require('./controllers/outfitController');
const authenticateToken = require('./middleware/authMiddleware');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================================================
// MIDDLEWARE CONFIGURATION
// =========================================================================

// Enable Cross-Origin Resource Sharing (CORS) so the React Native Expo app
// can successfully make fetch calls to this API even when hosted on a different IP/port.
app.use(cors());

// Parse incoming requests with JSON payloads (replaces bodyParser.json())
app.use(express.json());

// Parse URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// =========================================================================
// ROUTE REGISTRATION
// =========================================================================

// 1. Health Probe Endpoint
// Used to verify that the server is online and running before connecting components.
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// 2. Authentication Endpoint (/auth)
app.use('/auth', authRoutes);

// 3. User Endpoint (/users)
app.use('/users', userRoutes);

// 4. Wardrobe Items Endpoint (/wardrobe)
app.use('/wardrobe', wardrobeRoutes);

// 5. Outfit Catalog Endpoint (/outfits)
app.use('/outfits', outfitRoutes);

// 6. Swipes Endpoint (/swipes)
app.use('/swipes', swipeRoutes);

// 6b. Closet sections Endpoint (/sections) — shelves & drawers
app.use('/sections', sectionRoutes);

// 7. Suggestions Endpoints
// /suggestions/wardrobe — closet-first: outfits composed from the user's own
// wardrobe (registered before /suggestions only for readability; Express
// matches exact paths either way).
app.get('/suggestions/wardrobe', authenticateToken, outfitController.getWardrobeSuggestions);
// /suggestions — curated catalog ("ideas from outside")
app.get('/suggestions', authenticateToken, outfitController.getSuggestions);

// =========================================================================
// ERROR HANDLING
// =========================================================================

// Catch-all route handler for unknown/undefined endpoints (404)
app.use((req, res, next) => {
  const err = new Error(`Cannot find requested route ${req.method} ${req.originalUrl} on this server.`);
  err.status = 404;
  next(err);
});

// Global error handling middleware. Must be registered AFTER all routes.
app.use(errorHandler);

// =========================================================================
// START SERVER
// =========================================================================
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` KLOSET Backend Server started!          `);
  console.log(` Port: ${PORT}                           `);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
  console.log(` Health check: http://localhost:${PORT}/health `);
  console.log(`=========================================`);
});
