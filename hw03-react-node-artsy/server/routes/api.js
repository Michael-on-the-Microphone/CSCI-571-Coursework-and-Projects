const express = require('express');
const router = express.Router();
const {
  searchArtists,
  fetchArtistData,
  fetchArtworkData,
  fetchCategories,
  getSimilarArtistData,
  updateFavorites,
  login,
  register,
  logout,
  deleteUser,
  me
} = require('../controllers/index');

// Add error handling middleware with better logging
const asyncHandler = (fn) => (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  Promise.resolve(fn(req, res, next))
    .catch(err => {
      console.error(`API Error in ${req.method} ${req.originalUrl}:`, err);
      next(err);
    });
};

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Public endpoints
router.get('/searchArtists', asyncHandler(searchArtists));
router.get('/fetchArtistData', asyncHandler(fetchArtistData));
router.get('/fetchArtworkData', asyncHandler(fetchArtworkData));
router.get('/fetchCategories', asyncHandler(fetchCategories));
router.get('/getSimilarArtistData', asyncHandler(getSimilarArtistData));
router.post('/updateFavorites', asyncHandler(updateFavorites));

// Auth endpoints
router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.post('/logout', asyncHandler(logout));
router.delete('/deleteUser', asyncHandler(deleteUser));
router.get('/me', asyncHandler(me));

module.exports = router;
