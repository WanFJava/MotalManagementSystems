const roomService = require('../services/roomService');

/**
 * «control» / Controller trong mô hình MVC
 * Chỉ đóng vai trò nhận request, gọi Service xử lý và trả response về View/Client
 * Phân hệ đảm nhiệm: Thành viên 1 - Quang (Room Management)
 */

// 1. [CREATE] Tạo phòng mới (UC04 / TC_ROOM_01, TC_ROOM_02)
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

// 3. [SEARCH] Tìm kiếm và lọc phòng đa tiêu chí (UC02 / TC_ROOM_03)
exports.searchRooms = async (req, res) => {
  try {
    const filters = {
      keyword: req.query.keyword,
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      minArea: req.query.minArea,
      maxArea: req.query.maxArea,
      amenity: req.query.amenity
    };
    const rooms = await roomService.searchRooms(filters);
    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 4. [READ ONE] Lấy chi tiết phòng theo ID
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

// 5. [UPDATE] Cập nhật thông tin phòng (UC04 / TC_ROOM_04)
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

// 6. [DELETE] Xóa phòng (UC04 / TC_ROOM_05)
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await roomService.deleteRoom(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Đã xóa phòng trọ thành công!",
      data: deletedRoom
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 7. [RENTAL REQUEST] Gửi yêu cầu thuê phòng (Phối hợp UC03)
exports.submitRentalRequest = async (req, res) => {
  try {
    const result = await roomService.submitRentalRequest(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
