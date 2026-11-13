import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/rental-requests';

export const rentalRequestClientService = {
  // Gửi yêu cầu thuê phòng mới (UC03)
  createRequest: async (requestData) => {
    const res = await axios.post(API_BASE_URL, requestData);
    return res.data;
  },

  // Lấy danh sách yêu cầu (hỗ trợ lọc theo userId, tenantPhone, roomId, status)
  getAllRequests: async (params = {}) => {
    const res = await axios.get(API_BASE_URL, { params });
    return res.data.data || [];
  },

  // Xem chi tiết một yêu cầu
  getRequestById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  // Cập nhật trạng thái yêu cầu (Quản lý duyệt: APPROVED / từ chối: REJECTED)
  updateStatus: async (id, status) => {
    const res = await axios.put(`${API_BASE_URL}/${id}`, { status });
    return res.data;
  },

  // Khách thuê chủ động hủy yêu cầu
  cancelRequest: async (id) => {
    const res = await axios.put(`${API_BASE_URL}/${id}`, { status: 'CANCELLED' });
    return res.data;
  }
};
