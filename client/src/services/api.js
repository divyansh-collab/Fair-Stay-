import axios from 'axios';

const API_BASE = '/api';
const AI_BASE = '/ai';

export const api = {
  // 1. Fetch Listings with filters
  async getListings(params = {}) {
    const res = await axios.get(`${API_BASE}/listings`, { params });
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
};

export default api;
