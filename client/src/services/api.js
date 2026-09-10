import axios from 'axios';

const API_BASE = '/api';
const AI_BASE = '/ai';

export const api = {
  // 1. Fetch Listings with filters
  async getListings(params = {}) {
    const res = await axios.get(`${API_BASE}/listings`, { params });
    return res.data;
  },

  // 1b. Fetch Single Listing by ID
  async getListing(id) {
    const res = await axios.get(`${API_BASE}/listings/${id}`);
    return res.data;
  },

  // 2. Instant multi-word search auto-suggest
  async searchListings(query) {
    if (!query || !query.trim()) return { results: [] };
    const res = await axios.get(`${API_BASE}/search`, { params: { q: query } });
    return res.data;
  },

  // 3. Top destination statistics & distribution
  async getDestinations() {
    const res = await axios.get(`${API_BASE}/destinations`);
    return res.data;
  },

  // 4. Predict Festival & Seasonal Pricing (AI & City-Centric Event Engine)
  async predictFestivalPrice(params = {}) {
    const res = await axios.get(`${AI_BASE}/predict-festival-price`, { params });
    return res.data;
  },

  // 5. Google Gemini AI Concierge Chat
  async sendAiMessage(message, history = []) {
    const res = await axios.post(`${AI_BASE}/chat`, { message, history });
    return res.data;
  },

  // 6. Bookings Management
  async createBooking(bookingData) {
    const res = await axios.post(`${API_BASE}/bookings`, bookingData);
    return res.data;
  },

  async getBookings() {
    const res = await axios.get(`${API_BASE}/bookings`);
    return res.data;
  },

  async cancelBooking(id) {
    const res = await axios.post(`${API_BASE}/bookings/${id}/cancel`);
    return res.data;
  },

  // 7. Host a Stay
  async createListing(listingData) {
    const res = await axios.post(`${API_BASE}/listings`, listingData);
    return res.data;
  },

  // 8. Reviews
  async submitReview(listingId, data) {
    const res = await axios.post(`${API_BASE}/reviews/${listingId}`, data);
    return res.data;
  },

  // 9. Availability
  async getAvailability(listingId) {
    const res = await axios.get(`${API_BASE}/listings/${listingId}/availability`);
    return res.data;
  },

  // Direct axios passthroughs for flexibility
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
};

export default api;

