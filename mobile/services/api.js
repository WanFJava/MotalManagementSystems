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

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const authApi = {
  // Đăng ký tài khoản (UC01 / TC_USER_01)
  register: (data) => api.post('/auth/register', data),
  // Đăng nhập hệ thống (UC01 / TC_USER_02)
  login: (data) => api.post('/auth/login', data),
  // Xem hồ sơ cá nhân (UC01 / UC06)
  getProfile: () => api.get('/users/profile'),
  // Cập nhật hồ sơ cá nhân (TC_USER_03)
  updateProfile: (data) => api.put('/users/profile', data),
};

export const userApi = {
  // Danh sách khách thuê (UC06)
  getTenants: (params) => api.get('/users/tenants', { params }),
  // Cập nhật hồ sơ CCCD khách thuê (UC06 / TC_USER_03)
  updateTenantProfile: (id, data) => api.put(`/users/${id}/tenant-profile`, data),
  // Danh sách nhân viên (UC15)
  getStaff: (params) => api.get('/users/staff', { params }),
  // Thêm nhân viên mới (UC15)
  createStaff: (data) => api.post('/users/staff', data),
  // Khóa / mở khóa tài khoản (TC_USER_04)
  toggleStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
  // Chi tiết người dùng theo ID
  getUserById: (id) => api.get(`/users/${id}`),
};

export default api;

