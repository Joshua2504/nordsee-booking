const db = require('../config/database');

class PropertyModel {
  /**
   * Create a new property
   */
  static async create(propertyData) {
    const [id] = await db('properties').insert(propertyData);
    return this.findById(id);
  }

  /**
   * Find property by ID
   */
  static async findById(id) {
    const property = await db('properties')
      .where('id', id)
      .first();
    
    if (!property) return null;

    // Get amenities
    const amenities = await db('property_amenities as pa')
      .join('amenities as a', 'pa.amenity_id', 'a.id')
      .where('pa.property_id', id)
      .select('a.id', 'a.name', 'a.icon', 'a.category');

    // Get images
    const images = await db('property_images')
      .where('property_id', id)
      .orderBy('display_order', 'asc')
      .select('id', 'file_name', 'file_path', 'thumbnail_path', 'medium_path', 'is_primary', 'alt_text', 'display_order');

    // Get host info
    const host = await db('users')
      .where('id', property.host_id)
      .select('id', 'first_name', 'last_name', 'avatar_url', 'created_at')
      .first();

    return {
      ...property,
      amenities,
      images,
      host
    };
  }

  /**
   * Find properties by host ID
   */
  static async findByHostId(hostId, filters = {}) {
    let query = db('properties')
      .where('host_id', hostId);

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    const properties = await query
      .orderBy('created_at', 'desc')
      .select('*');

    // Get primary images for each property
    for (let property of properties) {
      const primaryImage = await db('property_images')
        .where({ property_id: property.id, is_primary: true })
        .orWhere(function() {
          this.where('property_id', property.id)
            .orderBy('display_order', 'asc')
            .limit(1);
        })
        .first();
      
      property.primary_image = primaryImage;
    }

    return properties;
  }

  /**
   * Update property
   */
  static async update(id, propertyData) {
    await db('properties')
      .where('id', id)
      .update({
        ...propertyData,
        updated_at: db.fn.now()
      });
    
    return this.findById(id);
  }

  /**
   * Delete property
   */
  static async delete(id) {
    await db('properties')
      .where('id', id)
      .delete();
  }

  /**
   * Add amenities to property
   */
  static async addAmenities(propertyId, amenityIds) {
    // Remove existing amenities
    await db('property_amenities')
      .where('property_id', propertyId)
      .delete();

    // Add new amenities
    if (amenityIds && amenityIds.length > 0) {
      const amenities = amenityIds.map(amenityId => ({
        property_id: propertyId,
        amenity_id: amenityId
      }));
      await db('property_amenities').insert(amenities);
    }
  }

  /**
   * Add image to property
   */
  static async addImage(imageData) {
    const [id] = await db('property_images').insert(imageData);
    return db('property_images').where('id', id).first();
  }

  /**
   * Update image
   */
  static async updateImage(id, imageData) {
    await db('property_images')
      .where('id', id)
      .update(imageData);
  }

  /**
   * Delete image
   */
  static async deleteImage(id) {
    const image = await db('property_images').where('id', id).first();
    await db('property_images').where('id', id).delete();
    return image;
  }

  /**
   * Set primary image
   */
  static async setPrimaryImage(propertyId, imageId) {
    // Remove primary flag from all images
    await db('property_images')
      .where('property_id', propertyId)
      .update({ is_primary: false });

    // Set new primary image
    await db('property_images')
      .where('id', imageId)
      .update({ is_primary: true });
  }

  /**
   * Search properties with filters
   */
  static async search(filters = {}, pagination = { page: 1, limit: 20 }) {
    const {
      city,
      checkIn,
      checkOut,
      guests,
      minPrice,
      maxPrice,
      propertyType,
      amenities,
      instantBook,
      bedrooms,
      bathrooms,
      bounds // { north, south, east, west }
    } = filters;

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = db('properties as p')
      .where('p.status', 'published');

    // City filter
    if (city) {
      query = query.where('p.city', 'like', `%${city}%`);
    }

    // Guest capacity
    if (guests) {
      query = query.where('p.guest_capacity', '>=', guests);
    }

    // Property type
    if (propertyType) {
      query = query.where('p.property_type', propertyType);
    }

    // Bedrooms
    if (bedrooms) {
      query = query.where('p.bedrooms', '>=', bedrooms);
    }

    // Bathrooms
    if (bathrooms) {
      query = query.where('p.bathrooms', '>=', bathrooms);
    }

    // Price range (base price)
    if (minPrice) {
      query = query.where('p.base_price', '>=', minPrice);
    }
    if (maxPrice) {
      query = query.where('p.base_price', '<=', maxPrice);
    }

    // Map bounds filter
    if (bounds) {
      query = query
        .whereBetween('p.latitude', [bounds.south, bounds.north])
        .whereBetween('p.longitude', [bounds.west, bounds.east]);
    }

    // Date availability filter
    if (checkIn && checkOut) {
      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      
      query = query.whereIn('p.id', function() {
        this.select('property_id')
          .from('availability_calendar')
          .whereBetween('date', [checkIn, checkOut])
          .where('status', 'available')
          .groupBy('property_id')
          .havingRaw('COUNT(*) = ?', [nights]);
      });

      // Instant book filter
      if (instantBook) {
        query = query.whereIn('p.id', function() {
          this.select('property_id')
            .from('availability_calendar')
            .whereBetween('date', [checkIn, checkOut])
            .where('requires_approval', false)
            .groupBy('property_id')
            .havingRaw('COUNT(*) = ?', [nights]);
        });
      }
    }

    // Amenities filter (property must have ALL selected amenities)
    if (amenities && amenities.length > 0) {
      query = query.whereIn('p.id', function() {
        this.select('property_id')
          .from('property_amenities')
          .whereIn('amenity_id', amenities)
          .groupBy('property_id')
          .havingRaw('COUNT(DISTINCT amenity_id) = ?', [amenities.length]);
      });
    }

    // Get total count
    const countQuery = query.clone();
    const [{ total }] = await countQuery.count('* as total');

    // Get properties with pagination
    const properties = await query
      .select('p.*')
      .limit(limit)
      .offset(offset)
      .orderBy('p.base_price', 'asc');

    // Get primary images
    for (let property of properties) {
      const primaryImage = await db('property_images')
        .where({ property_id: property.id, is_primary: true })
        .orWhere(function() {
          this.where('property_id', property.id)
            .orderBy('display_order', 'asc')
            .limit(1);
        })
        .select('id', 'file_name', 'thumbnail_path', 'medium_path')
        .first();
      
      property.primary_image = primaryImage;
    }

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Generate availability calendar for property (12 months ahead)
   */
  static async generateAvailabilityCalendar(propertyId, basePrice) {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12);

    const dates = [];
    const currentDate = new Date(today);

    while (currentDate <= endDate) {
      dates.push({
        property_id: propertyId,
        date: currentDate.toISOString().split('T')[0],
        is_available: true,
        price: basePrice,
        requires_approval: false,
        status: 'available'
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert in batches to avoid query size limits
    const batchSize = 100;
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);
      await db('availability_calendar').insert(batch);
    }
  }

  /**
   * Get availability for date range
   */
  static async getAvailability(propertyId, startDate, endDate) {
    return await db('availability_calendar')
      .where('property_id', propertyId)
      .whereBetween('date', [startDate, endDate])
      .orderBy('date', 'asc')
      .select('*');
  }

  /**
   * Update availability for a date range
   */
  static async updateAvailability(propertyId, startDate, endDate, updates) {
    await db('availability_calendar')
      .where('property_id', propertyId)
      .whereBetween('date', [startDate, endDate])
      .update({
        ...updates,
        updated_at: db.fn.now()
      });
  }

  /**
   * Check if property is available for booking
   */
  static async checkAvailability(propertyId, checkIn, checkOut) {
    // Calculate nights (checkout date is not included in the stay)
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Check availability for check-in date up to (but not including) checkout date
    const dayBeforeCheckout = new Date(checkOutDate);
    dayBeforeCheckout.setDate(dayBeforeCheckout.getDate() - 1);
    
    const availableDays = await db('availability_calendar')
      .where('property_id', propertyId)
      .where('date', '>=', checkIn)
      .where('date', '<=', dayBeforeCheckout.toISOString().split('T')[0])
      .where('is_available', true)
      .where('status', 'available')
      .count('* as count')
      .first();

    // If no availability records found, return false
    if (!availableDays || availableDays.count === 0) {
      return false;
    }

    return availableDays.count >= nights;
  }

  /**
   * Get price for date range
   */
  static async getPriceForDateRange(propertyId, checkIn, checkOut) {
    // Calculate price for check-in date up to (but not including) checkout date
    const checkOutDate = new Date(checkOut);
    const dayBeforeCheckout = new Date(checkOutDate);
    dayBeforeCheckout.setDate(dayBeforeCheckout.getDate() - 1);
    
    const prices = await db('availability_calendar')
      .where('property_id', propertyId)
      .where('date', '>=', checkIn)
      .where('date', '<=', dayBeforeCheckout.toISOString().split('T')[0])
      .sum('price as total')
      .first();

    return prices.total || 0;
  }
}

module.exports = PropertyModel;
