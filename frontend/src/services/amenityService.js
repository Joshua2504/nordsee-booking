import api from './api';

const amenityService = {
  /**
   * Get all amenities
   */
  async getAll() {
    const response = await api.get('/amenities');
    return response.data;
  },

  /**
   * Get amenities grouped by category
   */
  async getByCategory() {
    const response = await api.get('/amenities/by-category');
    return response.data;
  }
};

export default amenityService;
