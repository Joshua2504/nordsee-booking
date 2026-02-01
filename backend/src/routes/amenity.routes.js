const express = require('express');
const router = express.Router();
const AmenityController = require('../controllers/amenity.controller');

// Get all amenities (public)
router.get('/', AmenityController.getAll);

// Get amenities grouped by category (public)
router.get('/by-category', AmenityController.getByCategory);

module.exports = router;
