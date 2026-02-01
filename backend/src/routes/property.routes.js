const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/property.controller');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const propertyValidation = [
  body('title').trim().notEmpty().isLength({ min: 3, max: 255 }),
  body('description').trim().notEmpty().isLength({ min: 20 }),
  body('property_type').isIn(['house', 'apartment', 'cottage', 'villa', 'room', 'other']),
  body('address').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('postal_code').trim().notEmpty(),
  body('guest_capacity').isInt({ min: 1, max: 50 }),
  body('bedrooms').isInt({ min: 0, max: 50 }),
  body('beds').isInt({ min: 1, max: 100 }),
  body('bathrooms').isNumeric().custom(value => value >= 0 && value <= 50),
  body('base_price').isFloat({ min: 1, max: 100000 }),
  body('cleaning_fee').optional().isFloat({ min: 0, max: 10000 })
];

// Search properties (public)
router.get('/search', PropertyController.search);

// Get properties by host (authenticated) - MUST come before /:id
router.get('/host/my-properties', authenticate, PropertyController.getByHost);

// Create property (authenticated, host only)
router.post('/', authenticate, propertyValidation, PropertyController.create);

// Get property by ID (public)
router.get('/:id', PropertyController.getById);

// Get availability for property (public)
router.get('/:id/availability', PropertyController.getAvailability);

// Update availability (authenticated, host only)
router.put('/:id/availability', authenticate, PropertyController.updateAvailability);

// Image management (authenticated, host only)
router.post('/:id/images', authenticate, PropertyController.addImage);
router.delete('/:id/images/:imageId', authenticate, PropertyController.deleteImage);
router.put('/:id/images/:imageId/primary', authenticate, PropertyController.setPrimaryImage);

// Update property (authenticated, host only)
router.put('/:id', authenticate, PropertyController.update);

// Delete property (authenticated, host only)
router.delete('/:id', authenticate, PropertyController.delete);

module.exports = router;
