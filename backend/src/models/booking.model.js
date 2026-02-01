const db = require('../config/database');

class BookingModel {
  /**
   * Create a new booking
   */
  static async create(bookingData) {
    const [id] = await db('bookings').insert(bookingData);
    return this.findById(id);
  }

  /**
   * Find booking by ID
   */
  static async findById(id) {
    const booking = await db('bookings')
      .where('bookings.id', id)
      .first();
    
    if (!booking) return null;

    // Get property details
    const property = await db('properties')
      .where('id', booking.property_id)
      .select('id', 'title', 'city', 'address', 'property_type')
      .first();

    // Get guest details
    const guest = await db('users')
      .where('id', booking.guest_id)
      .select('id', 'first_name', 'last_name', 'email', 'phone', 'avatar_url')
      .first();

    // Get host details
    const host = await db('users')
      .where('id', booking.host_id)
      .select('id', 'first_name', 'last_name', 'email', 'phone', 'avatar_url')
      .first();

    // Get property primary image
    const primaryImage = await db('property_images')
      .where({ property_id: booking.property_id, is_primary: true })
      .orWhere(function() {
        this.where('property_id', booking.property_id)
          .orderBy('display_order', 'asc')
          .limit(1);
      })
      .select('thumbnail_path', 'medium_path')
      .first();

    return {
      ...booking,
      property: {
        ...property,
        primary_image: primaryImage
      },
      guest,
      host
    };
  }

  /**
   * Find bookings by guest ID
   */
  static async findByGuestId(guestId, filters = {}) {
    let query = db('bookings')
      .where('guest_id', guestId);

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    if (filters.timeframe === 'upcoming') {
      query = query.where('check_in', '>=', today);
    } else if (filters.timeframe === 'past') {
      query = query.where('check_out', '<', today);
    }

    const bookings = await query
      .orderBy('check_in', 'desc')
      .select('*');

    // Enrich with property and host data
    for (let booking of bookings) {
      const property = await db('properties')
        .where('id', booking.property_id)
        .select('id', 'title', 'city', 'address', 'property_type')
        .first();

      const host = await db('users')
        .where('id', booking.host_id)
        .select('id', 'first_name', 'last_name', 'avatar_url')
        .first();

      const primaryImage = await db('property_images')
        .where({ property_id: booking.property_id, is_primary: true })
        .orWhere(function() {
          this.where('property_id', booking.property_id)
            .orderBy('display_order', 'asc')
            .limit(1);
        })
        .select('thumbnail_path', 'medium_path')
        .first();

      booking.property = {
        ...property,
        primary_image: primaryImage
      };
      booking.host = host;
    }

    return bookings;
  }

  /**
   * Find bookings by host ID
   */
  static async findByHostId(hostId, filters = {}) {
    let query = db('bookings')
      .where('host_id', hostId);

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.propertyId) {
      query = query.where('property_id', filters.propertyId);
    }

    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    if (filters.timeframe === 'upcoming') {
      query = query.where('check_in', '>=', today);
    } else if (filters.timeframe === 'past') {
      query = query.where('check_out', '<', today);
    }

    const bookings = await query
      .orderBy('check_in', 'desc')
      .select('*');

    // Enrich with property and guest data
    for (let booking of bookings) {
      const property = await db('properties')
        .where('id', booking.property_id)
        .select('id', 'title', 'city', 'address', 'property_type')
        .first();

      const guest = await db('users')
        .where('id', booking.guest_id)
        .select('id', 'first_name', 'last_name', 'email', 'phone', 'avatar_url')
        .first();

      const primaryImage = await db('property_images')
        .where({ property_id: booking.property_id, is_primary: true })
        .orWhere(function() {
          this.where('property_id', booking.property_id)
            .orderBy('display_order', 'asc')
            .limit(1);
        })
        .select('thumbnail_path', 'medium_path')
        .first();

      booking.property = {
        ...property,
        primary_image: primaryImage
      };
      booking.guest = guest;
    }

    return bookings;
  }

  /**
   * Update booking
   */
  static async update(id, bookingData) {
    await db('bookings')
      .where('id', id)
      .update({
        ...bookingData,
        updated_at: db.fn.now()
      });
    
    return this.findById(id);
  }

  /**
   * Cancel booking
   */
  static async cancel(id, cancellationReason) {
    await db('bookings')
      .where('id', id)
      .update({
        status: 'cancelled',
        cancellation_reason: cancellationReason,
        updated_at: db.fn.now()
      });
    
    return this.findById(id);
  }

  /**
   * Approve booking
   */
  static async approve(id) {
    await db('bookings')
      .where('id', id)
      .update({
        status: 'confirmed',
        updated_at: db.fn.now()
      });
    
    return this.findById(id);
  }

  /**
   * Reject booking
   */
  static async reject(id, reason) {
    await db('bookings')
      .where('id', id)
      .update({
        status: 'rejected',
        cancellation_reason: reason,
        updated_at: db.fn.now()
      });
    
    return this.findById(id);
  }

  /**
   * Check for booking conflicts
   */
  static async checkConflicts(propertyId, checkIn, checkOut, excludeBookingId = null) {
    let query = db('bookings')
      .where('property_id', propertyId)
      .whereIn('status', ['pending', 'confirmed'])
      .where(function() {
        this.whereBetween('check_in', [checkIn, checkOut])
          .orWhereBetween('check_out', [checkIn, checkOut])
          .orWhere(function() {
            this.where('check_in', '<=', checkIn)
              .where('check_out', '>=', checkOut);
          });
      });

    if (excludeBookingId) {
      query = query.whereNot('id', excludeBookingId);
    }

    const conflicts = await query.select('*');
    return conflicts.length > 0;
  }

  /**
   * Get bookings for a property in a date range (for calendar view)
   */
  static async getPropertyBookings(propertyId, startDate, endDate) {
    return await db('bookings')
      .where('property_id', propertyId)
      .whereIn('status', ['pending', 'confirmed'])
      .where(function() {
        this.whereBetween('check_in', [startDate, endDate])
          .orWhereBetween('check_out', [startDate, endDate])
          .orWhere(function() {
            this.where('check_in', '<=', startDate)
              .where('check_out', '>=', endDate);
          });
      })
      .select('*');
  }
}

module.exports = BookingModel;
