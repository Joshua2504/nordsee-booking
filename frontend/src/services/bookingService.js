import api from './api';

const bookingService = {
  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  /**
   * Get booking by ID
   */
  async getBooking(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Get my bookings (as guest)
   */
  async getMyBookings(filters = {}) {
    const response = await api.get('/bookings/guest/my-bookings', { params: filters });
    return response.data;
  },

  /**
   * Get host bookings
   */
  async getHostBookings(filters = {}) {
    const response = await api.get('/bookings/host/bookings', { params: filters });
    return response.data;
  },

  /**
   * Get property calendar with bookings
   */
  async getPropertyCalendar(propertyId, startDate, endDate) {
    const response = await api.get(`/bookings/host/property/${propertyId}/calendar`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  /**
   * Approve booking
   */
  async approveBooking(id) {
    const response = await api.put(`/bookings/${id}/approve`);
    return response.data;
  },

  /**
   * Reject booking
   */
  async rejectBooking(id, reason) {
    const response = await api.put(`/bookings/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Cancel booking
   */
  async cancelBooking(id, reason) {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  }
};

export default bookingService;
