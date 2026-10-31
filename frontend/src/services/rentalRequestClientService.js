import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/rental-requests';

export const rentalRequestClientService = {
  getAllRequests: async (params = {}) => {
    const res = await axios.get(API_BASE_URL, { params });
    return res.data.data || [];
  },

  getRequestById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  updateStatus: async (id, status) => {
    const res = await axios.put(`${API_BASE_URL}/${id}`, { status });
    return res.data;
  }
};

