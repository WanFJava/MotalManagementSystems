import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/contracts';

export const contractClientService = {
  // Lấy danh sách hợp đồng (hỗ trợ lọc theo tenantId, tenantPhone, roomId, status)
  getAllContracts: async (params = {}) => {
    const res = await axios.get(API_BASE_URL, { params });
    return res.data.data || [];
  },

  // Chi tiết hợp đồng
  getContractById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  // Tạo hợp đồng mới (UC05)
  createContract: async (contractData) => {
    const res = await axios.post(API_BASE_URL, contractData);
    return res.data;
  },

  // Gia hạn hợp đồng (UC05.1)
  extendContract: async (id, endDate) => {
    const res = await axios.put(`${API_BASE_URL}/${id}/extend`, { endDate });
    return res.data;
  },

  // Thanh lý hợp đồng (UC05.2)
  terminateContract: async (id) => {
    const res = await axios.put(`${API_BASE_URL}/${id}/terminate`);
    return res.data;
  }
};
