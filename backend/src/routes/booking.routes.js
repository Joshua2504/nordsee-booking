const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const bookingValidation = [
  body('property_id').isInt(),
  body('check_in').isDate(),
  body('check_out').isDate(),
  body('guests').isInt({ min: 1, max: 50 })
];

// Create booking (authenticated, guest)
router.post('/', authenticate, bookingValidation, BookingController.create);

// Get my bookings as guest (authenticated) - MUST come before /:id
router.get('/guest/my-bookings', authenticate, BookingController.getMyBookings);

// Get bookings as host (authenticated)
router.get('/host/bookings', authenticate, BookingController.getHostBookings);

// Get property calendar with bookings (authenticated, host)
router.get('/host/property/:propertyId/calendar', authenticate, BookingController.getPropertyCalendar);

// Get booking by ID (authenticated)
router.get('/:id', authenticate, BookingController.getById);

// Approve booking (authenticated, host)
router.put('/:id/approve', authenticate, BookingController.approve);

// Reject booking (authenticated, host)
router.put('/:id/reject', authenticate, BookingController.reject);

// Cancel booking (authenticated, guest or host)
router.put('/:id/cancel', authenticate, BookingController.cancel);

module.exports = router;
