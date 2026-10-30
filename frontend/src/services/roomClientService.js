import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/rooms';

/**
 * Client Service đóng vai trò Client Controller / API Boundary trong kiến trúc MVC
 * Phân hệ đảm nhiệm: Thành viên 1 - Quang (Room Management)
 */
export const roomClientService = {
  // 1. Lấy danh sách tất cả các phòng
  getAllRooms: async () => {
    const res = await axios.get(API_BASE_URL);
    return res.data.data || [];
  },

  // 2. Tìm kiếm và lọc phòng đa tiêu chí (UC02)
  searchRooms: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minArea) params.append('minArea', filters.minArea);
    if (filters.maxArea) params.append('maxArea', filters.maxArea);
    if (filters.amenity) params.append('amenity', filters.amenity);

    const res = await axios.get(`${API_BASE_URL}/search?${params.toString()}`);
    return res.data.data || [];
  },

  // 3. Lấy chi tiết một phòng theo ID
  getRoomById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/${id}`);
    return res.data.data;
  },

  // 4. Tạo phòng mới (UC04 / TC_ROOM_01, TC_ROOM_02)
  createRoom: async (roomData) => {
    const res = await axios.post(API_BASE_URL, roomData);
    return res.data;
  },

  // 5. Cập nhật thông tin phòng (UC04 / TC_ROOM_04)
  updateRoom: async (id, roomData) => {
    const res = await axios.put(`${API_BASE_URL}/${id}`, roomData);
    return res.data;
  },

  // 6. Xóa phòng (UC04 / TC_ROOM_05)
  deleteRoom: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/${id}`);
    return res.data;
  },

  // 7. Gửi yêu cầu thuê phòng (Phối hợp UC03)
  submitRentalRequest: async (id, requestData) => {
    const res = await axios.post(`${API_BASE_URL}/${id}/rental-request`, requestData);
    return res.data;
  }
};
