import axios from 'axios';
import { Platform } from 'react-native';

// Địa chỉ IP của backend:
// - Android Emulator: 10.0.2.2
// - iOS Simulator hoặc Web: localhost
// - Thiết bị thật: IP mạng LAN (ví dụ 192.168.1.x)
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const rentalRequestApi = {
  // Gửi yêu cầu thuê phòng
  createRequest: (data) => api.post('/rental-requests', data),
  // Lấy danh sách yêu cầu
  getRequests: (params) => api.get('/rental-requests', { params }),
  // Chi tiết yêu cầu
  getRequestById: (id) => api.get(`/rental-requests/${id}`),
  // Duyệt/từ chối yêu cầu
  updateStatus: (id, status) => api.put(`/rental-requests/${id}`, { status }),
};

export const contractApi = {
  // Lập hợp đồng mới
  createContract: (data) => api.post('/contracts', data),
  // Lấy danh sách hợp đồng
  getContracts: () => api.get('/contracts'),
  // Chi tiết hợp đồng
  getContractById: (id) => api.get(`/contracts/${id}`),
  // Gia hạn hợp đồng
  extendContract: (id, endDate) => api.put(`/contracts/${id}/extend`, { endDate }),
  // Thanh lý hợp đồng
  terminateContract: (id) => api.put(`/contracts/${id}/terminate`),
};

export const roomApi = {
  getRooms: () => api.get('/rooms'),
};

export default api;

