import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/utilities';

export const utilityClientService = {
  getAllUtilities: async (params = {}) => {
    const res = await axios.get(API_BASE_URL, { params });
    return res.data.data || [];
  },

  getLatestUtility: async (roomId) => {
    const res = await axios.get(`${API_BASE_URL}/latest/${roomId}`);
    return res.data.data;
  },

  recordUtility: async (readingData) => {
    const res = await axios.post(API_BASE_URL, readingData);
    return res.data;
  },

  updateUtility: async (id, data) => {
    const res = await axios.put(`${API_BASE_URL}/${id}`, data);
    return res.data;
  },

  deleteUtility: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/${id}`);
    return res.data;
  }
};
