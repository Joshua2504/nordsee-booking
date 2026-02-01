const AmenityModel = require('../models/amenity.model');

class AmenityController {
  /**
   * Get all amenities
   */
  static async getAll(req, res) {
    try {
      const amenities = await AmenityModel.findAll();

      res.json({ 
        amenities,
        count: amenities.length 
      });
    } catch (error) {
      console.error('Error fetching amenities:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }

  /**
   * Get amenities grouped by category
   */
  static async getByCategory(req, res) {
    try {
      const amenities = await AmenityModel.findByCategory();

      res.json({ amenities });
    } catch (error) {
      console.error('Error fetching amenities by category:', error);
      res.status(500).json({ 
        message: req.t('server_error'),
        error: error.message 
      });
    }
  }
}

module.exports = AmenityController;
