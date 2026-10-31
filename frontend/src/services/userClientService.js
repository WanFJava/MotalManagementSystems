import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Helper: Lấy JWT Token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('motel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Client Service tương tác API Quản lý Tài khoản & Khách thuê
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 */
export const userClientService = {
  // --- 1. Xác thực tài khoản (UC01 / SWR2.1, SWR2.2) ---
  register: async (userData) => {
    const res = await axios.post(`${API_BASE}/auth/register`, userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await axios.post(`${API_BASE}/auth/login`, credentials);
    if (res.data?.data?.token) {
      localStorage.setItem('motel_token', res.data.data.token);
      localStorage.setItem('motel_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('motel_token');
    localStorage.removeItem('motel_user');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('motel_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getMe: async () => {
    const res = await axios.get(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.data.data;
  },

  // --- 1.1. Hồ sơ cá nhân (Profile - UC01 / UC06 / SWR2.3) ---
  getProfile: async (userId) => {
    const params = userId ? { userId } : {};
    const res = await axios.get(`${API_BASE}/users/profile`, {
      params,
      headers: { ...getAuthHeaders(), 'x-user-id': userId }
    });
    return res.data.data;
  },

  updateProfile: async (userId, profileData) => {
    const res = await axios.put(`${API_BASE}/users/profile`, { ...profileData, userId }, {
      headers: { ...getAuthHeaders(), 'x-user-id': userId }
    });
    // Đồng bộ lại thông tin vào LocalStorage nếu cập nhật thành công
    if (res.data?.data) {
      const user = res.data.data;
      localStorage.setItem('motel_user', JSON.stringify(user));
    }
    return res.data;
  },

  // --- 2. Quản lý Khách thuê (Tenant Profile - UC06 / SWR2.3) ---
  getTenants: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.roomId) params.append('roomId', filters.roomId);
    if (filters.temporaryResidenceStatus) params.append('temporaryResidenceStatus', filters.temporaryResidenceStatus);

    const res = await axios.get(`${API_BASE}/users/tenants?${params.toString()}`);
    return res.data.data || [];
  },

  updateTenantProfile: async (id, profileData) => {
    const res = await axios.put(`${API_BASE}/users/${id}/tenant-profile`, profileData, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  // --- 3. Quản lý Nhân viên (Staff Management - UC15 / SWR2.4) ---
  getStaff: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

    const res = await axios.get(`${API_BASE}/users/staff?${params.toString()}`);
    return res.data.data || [];
  },

  createStaff: async (staffData) => {
    const res = await axios.post(`${API_BASE}/users/staff`, staffData, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  toggleUserStatus: async (id, isActive) => {
    const res = await axios.put(`${API_BASE}/users/${id}/status`, { isActive }, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  // --- 4. Người dùng chung ---
  getUserById: async (id) => {
    const res = await axios.get(`${API_BASE}/users/${id}`);
    return res.data.data;
  },

  updateUser: async (id, userData) => {
    const res = await axios.put(`${API_BASE}/users/${id}`, userData, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await axios.delete(`${API_BASE}/users/${id}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  }
};
