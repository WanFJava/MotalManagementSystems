const roomService = require('../services/roomService');

/**
 * «control» / Controller trong mô hình MVC
 * Chỉ đóng vai trò nhận request, gọi Service xử lý và trả response về View/Client
 */

// 1. [CREATE] Tạo phòng mới
exports.createRoom = async (req, res) => {
  try {
    const newRoom = await roomService.createRoom(req.body);
    return res.status(201).json({
      success: true,
      message: "Tạo phòng mới thành công!",
      data: newRoom
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 2. [READ ALL] Lấy danh sách tất cả phòng
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. [READ ONE] Lấy chi tiết phòng theo ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    return res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// 4. [UPDATE] Cập nhật thông tin phòng
exports.updateRoom = async (req, res) => {
  try {
    const updatedRoom = await roomService.updateRoom(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin phòng thành công!",
      data: updatedRoom
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 5. [DELETE] Xóa phòng
exports.deleteRoom = async (req, res) => {
  try {
    await roomService.deleteRoom(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Đã xóa phòng trọ thành công!"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
