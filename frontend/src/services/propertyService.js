import api from './api';

const propertyService = {
  /**
   * Get all properties for current host
   */
  async getMyProperties(filters = {}) {
    const response = await api.get('/properties/host/my-properties', { params: filters });
    return response.data;
  },

  /**
   * Get property by ID
   */
  async getProperty(id) {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  /**
   * Create new property
   */
  async createProperty(propertyData) {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  /**
   * Update property
   */
  async updateProperty(id, propertyData) {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  /**
   * Delete property
   */
  async deleteProperty(id) {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  /**
   * Search properties
   */
  async searchProperties(filters = {}, page = 1, limit = 20) {
    const params = { ...filters, page, limit };
    const response = await api.get('/properties/search', { params });
    return response.data;
  },

  /**
   * Get availability for property
   */
  async getAvailability(propertyId, startDate, endDate) {
    const response = await api.get(`/properties/${propertyId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  /**
   * Update availability for property (bulk dates)
   */
  async updateAvailability(propertyId, updates) {
    const response = await api.put(`/properties/${propertyId}/availability`, updates);
    return response.data;
  },

  /**
   * Upload image for property
   */
  async uploadImage(propertyId, formData) {
    const response = await api.post(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Delete image
   */
  async deleteImage(propertyId, imageId) {
    const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
    return response.data;
  },

  /**
   * Set primary image
   */
  async setPrimaryImage(propertyId, imageId) {
    const response = await api.put(`/properties/${propertyId}/images/${imageId}/primary`);
    return response.data;
  }
};

export default propertyService;
