const db = require('../config/database');

class AmenityModel {
  /**
   * Get all amenities
   */
  static async findAll() {
    return await db('amenities')
      .select('*')
      .orderBy('category', 'asc')
      .orderBy('name', 'asc');
  }

  /**
   * Get amenities grouped by category
   */
  static async findByCategory() {
    const amenities = await this.findAll();
    
    const grouped = {
      essentials: [],
      features: [],
      location: [],
      safety: [],
      accessibility: []
    };

    amenities.forEach(amenity => {
      if (grouped[amenity.category]) {
        grouped[amenity.category].push(amenity);
      }
    });

    return grouped;
  }

  /**
   * Get amenities by IDs
   */
  static async findByIds(ids) {
    return await db('amenities')
      .whereIn('id', ids)
      .select('*');
  }
}

module.exports = AmenityModel;
