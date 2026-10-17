import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/rooms';

/**
 * Client Service đóng vai trò Controller/Service tầng Client trong kiến trúc MVC
 */
export const roomClientService = {
  // Lấy tất cả phòng
  getAllRooms: async () => {
    const res = await axios.get(API_BASE_URL);
    return res.data.data || [];
  },

  // Tạo mới phòng
  createRoom: async (roomData) => {
    const res = await axios.post(API_BASE_URL, roomData);
    return res.data.data;
  },

  // Cập nhật phòng
  updateRoom: async (id, roomData) => {
    const res = await axios.put(`${API_BASE_URL}/${id}`, roomData);
    return res.data.data;
  },

  // Xóa phòng
  deleteRoom: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/${id}`);
    return res.data;
  }
};
