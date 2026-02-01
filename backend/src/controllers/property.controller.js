const PropertyModel = require('../models/property.model');
const { validationResult } = require('express-validator');
const db = require('../config/database');

class PropertyController {
  /**
   * Create a new property
   */
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: req.t('validation_error'),
          errors: errors.array() 
        });
      }

      const userId = req.user.id;
      const propertyData = {
        host_id: userId,
        title: req.body.title,
        description: req.body.description,
        property_type: req.body.property_type,
        address: req.body.address,
        city: req.body.city,
        postal_code: req.body.postal_code,
        country: req.body.country || 'Germany',
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        guest_capacity: req.body.guest_capacity,
        bedrooms: req.body.bedrooms,
        beds: req.body.beds,
        bathrooms: req.body.bathrooms,
        base_price: req.body.base_price,
        cleaning_fee: req.body.cleaning_fee || 0,
        status: req.body.status || 'draft'
      };

      // Create property
      const property = await PropertyModel.create(propertyData);

      // Add amenities if provided
      if (req.body.amenities && req.body.amenities.length > 0) {
        await PropertyModel.addAmenities(property.id, req.body.amenities);
      }

      // Generate availability calendar (12 months ahead)
      await PropertyModel.generateAvailabilityCalendar(property.id, property.base_price);

      // Fetch complete property with amenities
      const completeProperty = await PropertyModel.findById(property.id);

      res.status(201).json({
        message: req.t('property_created'),
        property: completeProperty
      });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Get property by ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const property = await PropertyModel.findById(id);

      if (!property) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      res.json({ property });
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Get properties by host
   */
  static async getByHost(req, res) {
    try {
      const hostId = req.user.id;
      const { status } = req.query;

      const properties = await PropertyModel.findByHostId(hostId, { status });

      res.json({ 
        properties,
        count: properties.length 
      });
    } catch (error) {
      console.error('Error fetching host properties:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Update property
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if property exists and belongs to user
      const existingProperty = await PropertyModel.findById(id);
      if (!existingProperty) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      if (existingProperty.host_id !== userId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      const updateData = {};
      const allowedFields = [
        'title', 'description', 'property_type', 'address', 'city', 
        'postal_code', 'country', 'latitude', 'longitude', 'guest_capacity',
        'bedrooms', 'beds', 'bathrooms', 'base_price', 'cleaning_fee', 'status'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      // Update property
      const property = await PropertyModel.update(id, updateData);

      // Update amenities if provided
      if (req.body.amenities !== undefined) {
        await PropertyModel.addAmenities(id, req.body.amenities);
      }

      // Fetch complete updated property
      const completeProperty = await PropertyModel.findById(id);

      res.json({
        message: req.t('property_updated'),
        property: completeProperty
      });
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Delete property
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if property exists and belongs to user
      const property = await PropertyModel.findById(id);
      if (!property) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      if (property.host_id !== userId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      await PropertyModel.delete(id);

      res.json({ 
        message: req.t('property_deleted') 
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Search properties
   */
  static async search(req, res) {
    try {
      const filters = {
        city: req.query.city,
        checkIn: req.query.check_in,
        checkOut: req.query.check_out,
        guests: req.query.guests ? parseInt(req.query.guests) : undefined,
        minPrice: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
        maxPrice: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
        propertyType: req.query.property_type,
        amenities: req.query.amenities ? req.query.amenities.split(',').map(id => parseInt(id)) : undefined,
        instantBook: req.query.instant_book === 'true',
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms) : undefined,
        bounds: req.query.bounds ? JSON.parse(req.query.bounds) : undefined
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const result = await PropertyModel.search(filters, pagination);

      res.json(result);
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Get availability for property
   */
  static async getAvailability(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ 
          message: req.t('missing_dates') 
        });
      }

      const availability = await PropertyModel.getAvailability(id, start_date, end_date);

      res.json({ availability });
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Update availability for property
   */
  static async updateAvailability(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { start_date, end_date, updates, dates, is_available, status, price } = req.body;

      // Check if property exists and belongs to user
      const property = await PropertyModel.findById(id);
      if (!property) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      if (property.host_id !== userId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      // Handle bulk dates update (from calendar component)
      if (dates && Array.isArray(dates) && dates.length > 0) {
        const updateData = {};
        if (is_available !== undefined) updateData.is_available = is_available;
        if (status !== undefined) updateData.status = status;
        if (price !== undefined) updateData.price = price;

        // Update each date individually
        for (const date of dates) {
          const result = await db('availability_calendar')
            .where('property_id', id)
            .where('date', date)
            .update(updateData);
          
          console.log(`Updated ${result} row(s) for date ${date} with`, updateData);
        }

        // Sort dates to get proper range
        const sortedDates = [...dates].sort();
        const startDate = sortedDates[0];
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Fetching availability from ${startDate} to ${endDate}`);
        const updatedAvailability = await PropertyModel.getAvailability(id, startDate, endDate);

        return res.json({
          message: req.t('availability_updated'),
          availability: updatedAvailability
        });
      }

      // Handle date range update (legacy format)
      if (!start_date || !end_date || !updates) {
        return res.status(400).json({ 
          message: req.t('missing_required_fields') 
        });
      }

      await PropertyModel.updateAvailability(id, start_date, end_date, updates);

      const updatedAvailability = await PropertyModel.getAvailability(id, start_date, end_date);

      res.json({
        message: req.t('availability_updated'),
        availability: updatedAvailability
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Add image to property
   */
  static async addImage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if property exists and belongs to user
      const property = await PropertyModel.findById(id);
      if (!property) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      if (property.host_id !== userId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          message: 'No file uploaded' 
        });
      }

      // For now, use the same path for all sizes (will add sharp processing later)
      const relativePath = `/uploads/properties/${req.file.filename}`;
      
      const imageData = {
        property_id: id,
        file_name: req.file.filename,
        file_path: relativePath,
        thumbnail_path: relativePath,
        medium_path: relativePath,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        display_order: 0,
        is_primary: false
      };

      const image = await PropertyModel.addImage(imageData);

      res.status(201).json({
        message: 'Image uploaded successfully',
        image
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  }

  /**
   * Delete image
   */
  static async deleteImage(req, res) {
    try {
      const { id, imageId } = req.params;
      const userId = req.user.id;

      // Check if property exists and belongs to user
      const property = await PropertyModel.findById(id);
      if (!property) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      if (property.host_id !== userId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      await PropertyModel.deleteImage(imageId);

      res.json({ 
        message: req.t('image_deleted') 
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Set primary image
   */
  static async setPrimaryImage(req, res) {
    try {
      const { id, imageId } = req.params;
      const userId = req.user.id;

      // Check if property exists and belongs to user
      const property = await PropertyModel.findById(id);
      if (!property) {
        return res.status(404).json({ 
          message: req.t('property_not_found') 
        });
      }

      if (property.host_id !== userId) {
        return res.status(403).json({ 
          message: req.t('unauthorized') 
        });
      }

      await PropertyModel.setPrimaryImage(id, imageId);

      res.json({ 
        message: req.t('primary_image_set') 
      });
    } catch (error) {
      console.error('Error setting primary image:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }
}

module.exports = PropertyController;
