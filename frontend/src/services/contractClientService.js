import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/contracts';

export const contractClientService = {
  getAllContracts: async () => {
    const res = await axios.get(API_BASE_URL);
    return res.data.data || [];
  },

  getContractById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  createContract: async (contractData) => {
    const res = await axios.post(API_BASE_URL, contractData);
    return res.data;
  },

  extendContract: async (id, endDate) => {
    const res = await axios.put(`${API_BASE_URL}/${id}/extend`, { endDate });
    return res.data;
  },

  terminateContract: async (id) => {
    const res = await axios.put(`${API_BASE_URL}/${id}/terminate`);
    return res.data;
  }
};

