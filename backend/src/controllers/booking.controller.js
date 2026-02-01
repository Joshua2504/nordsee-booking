const BookingModel = require('../models/booking.model');
const PropertyModel = require('../models/property.model');
const db = require('../config/database');

class BookingController {
  /**
   * Create a new booking
   */
  static async create(req, res) {
    try {
      const guestId = req.user.id;
      const {
        property_id,
        check_in,
        check_out,
        guests,
        special_requests,
        payment_method
      } = req.body;

      // Validate required fields
      if (!property_id || !check_in || !check_out || !guests) {
        return res.status(400).json({ 
          message: req.t('missing_required_fields') 
        });
      }

      // Get property details
      const property = await PropertyModel.findById(property_id);
      if (!property) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      // Check guest capacity
      if (guests > property.guest_capacity) {
        return res.status(400).json({ 
          message: req.t('exceeds_guest_capacity') 
        });
      }

      // Check availability
      const isAvailable = await PropertyModel.checkAvailability(property_id, check_in, check_out);
      if (!isAvailable) {
        return res.status(400).json({ 
          message: req.t('property_not_available') 
        });
      }

      // Check for booking conflicts
      const hasConflicts = await BookingModel.checkConflicts(property_id, check_in, check_out);
      if (hasConflicts) {
        return res.status(400).json({ 
          message: req.t('booking_conflict') 
        });
      }

      // Calculate pricing
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      const baseAmount = await PropertyModel.getPriceForDateRange(property_id, check_in, check_out);
      const cleaningFee = property.cleaning_fee || 0;
      const serviceFee = baseAmount * 0.05; // 5% service fee
      const totalAmount = baseAmount + cleaningFee + serviceFee;

      // Check if requires approval
      const availabilityDays = await PropertyModel.getAvailability(property_id, check_in, check_out);
      const requiresApproval = availabilityDays.some(day => day.requires_approval);

      const bookingData = {
        property_id,
        guest_id: guestId,
        host_id: property.host_id,
        check_in,
        check_out,
        guests,
        nights,
        base_amount: baseAmount,
        cleaning_fee: cleaningFee,
        service_fee: serviceFee,
        total_amount: totalAmount,
        status: requiresApproval ? 'pending' : 'confirmed',
        payment_status: 'unpaid', // Mock payment
        payment_method: payment_method || 'credit_card',
        special_requests
      };

      // Create booking
      const booking = await BookingModel.create(bookingData);

      // Update availability calendar to 'booked' status if confirmed
      if (!requiresApproval) {
        await PropertyModel.updateAvailability(property_id, check_in, check_out, {
          status: 'booked'
        });
      } else {
        // Set to pending if requires approval
        await PropertyModel.updateAvailability(property_id, check_in, check_out, {
          status: 'pending'
        });
      }

      res.status(201).json({
        message: requiresApproval ? req.t('booking_request_sent') : req.t('booking_confirmed'),
        booking,
        requires_approval: requiresApproval
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Get booking by ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const booking = await BookingModel.findById(id);

      if (!booking) {
        return res.status(404).json({ 
          message: req.t('booking_not_found') 
        });
      }

      // Check if user is guest or host
      if (booking.guest_id !== userId && booking.host_id !== userId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      res.json({ booking });
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Get bookings for current user (as guest)
   */
  static async getMyBookings(req, res) {
    try {
      const guestId = req.user.id;
      const { status, timeframe } = req.query;

      const bookings = await BookingModel.findByGuestId(guestId, { status, timeframe });

      res.json({ 
        bookings,
        count: bookings.length 
      });
    } catch (error) {
      console.error('Error fetching guest bookings:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Get bookings for host
   */
  static async getHostBookings(req, res) {
    try {
      const hostId = req.user.id;
      const { status, timeframe, property_id } = req.query;

      const bookings = await BookingModel.findByHostId(hostId, { 
        status, 
        timeframe,
        propertyId: property_id 
      });

      res.json({ 
        bookings,
        count: bookings.length 
      });
    } catch (error) {
      console.error('Error fetching host bookings:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Approve booking (host only)
   */
  static async approve(req, res) {
    try {
      const { id } = req.params;
      const hostId = req.user.id;

      const booking = await BookingModel.findById(id);

      if (!booking) {
        return res.status(404).json({ 
          message: req.t('booking_not_found') 
        });
      }

      // Check if user is the host
      if (booking.host_id !== hostId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      // Check if booking is pending
      if (booking.status !== 'pending') {
        return res.status(400).json({ 
          message: req.t('booking_cannot_be_approved') 
        });
      }

      // Check for conflicts again
      const hasConflicts = await BookingModel.checkConflicts(
        booking.property_id, 
        booking.check_in, 
        booking.check_out,
        booking.id
      );

      if (hasConflicts) {
        return res.status(400).json({ 
          message: req.t('booking_conflict') 
        });
      }

      // Approve booking
      const updatedBooking = await BookingModel.approve(id);

      // Update availability calendar to 'booked'
      await PropertyModel.updateAvailability(
        booking.property_id, 
        booking.check_in, 
        booking.check_out, 
        { status: 'booked' }
      );

      res.json({
        message: req.t('booking_approved'),
        booking: updatedBooking
      });
    } catch (error) {
      console.error('Error approving booking:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Reject booking (host only)
   */
  static async reject(req, res) {
    try {
      const { id } = req.params;
      const hostId = req.user.id;
      const { reason } = req.body;

      const booking = await BookingModel.findById(id);

      if (!booking) {
        return res.status(404).json({ 
          message: req.t('booking_not_found') 
        });
      }

      // Check if user is the host
      if (booking.host_id !== hostId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      // Check if booking is pending
      if (booking.status !== 'pending') {
        return res.status(400).json({ 
          message: req.t('booking_cannot_be_rejected') 
        });
      }

      // Reject booking
      const updatedBooking = await BookingModel.reject(id, reason);

      // Revert availability calendar to 'available'
      await PropertyModel.updateAvailability(
        booking.property_id, 
        booking.check_in, 
        booking.check_out, 
        { status: 'available' }
      );

      res.json({
        message: req.t('booking_rejected'),
        booking: updatedBooking
      });
    } catch (error) {
      console.error('Error rejecting booking:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Cancel booking (guest or host)
   */
  static async cancel(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;

      const booking = await BookingModel.findById(id);

      if (!booking) {
        return res.status(404).json({ 
          message: req.t('booking_not_found') 
        });
      }

      // Check if user is guest or host
      if (booking.guest_id !== userId && booking.host_id !== userId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      // Check if booking can be cancelled
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return res.status(400).json({ 
          message: req.t('booking_cannot_be_cancelled') 
        });
      }

      // Cancel booking
      const updatedBooking = await BookingModel.cancel(id, reason);

      // Revert availability calendar to 'available'
      await PropertyModel.updateAvailability(
        booking.property_id, 
        booking.check_in, 
        booking.check_out, 
        { status: 'available' }
      );

      res.json({
        message: req.t('booking_cancelled'),
        booking: updatedBooking
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Get property booking calendar (for host)
   */
  static async getPropertyCalendar(req, res) {
    try {
      const { propertyId } = req.params;
      const hostId = req.user.id;
      const { start_date, end_date } = req.query;

      // Check if property exists and belongs to user
      const property = await PropertyModel.findById(propertyId);
      if (!property) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      if (property.host_id !== hostId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      if (!start_date || !end_date) {
        return res.status(400).json({ 
          message: req.t('missing_dates') 
        });
      }

      // Get availability
      const availability = await PropertyModel.getAvailability(propertyId, start_date, end_date);

      // Get bookings
      const bookings = await BookingModel.getPropertyBookings(propertyId, start_date, end_date);

      res.json({ 
        availability,
        bookings 
      });
    } catch (error) {
      console.error('Error fetching property calendar:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }
}

module.exports = BookingController;
