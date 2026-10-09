const Room = require('../models/Room');

// «control» - Xử lý logic nghiệp vụ cho Room

// 1. [CREATE] Tạo phòng mới
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, basePrice, maxOccupants, status } = req.body;
    const newRoom = new Room({ roomNumber, basePrice, maxOccupants, status });
    await newRoom.save();
    return res.status(201).json({ success: true, message: "Tạo phòng thành công", data: newRoom });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 2. [READ ALL] Lấy danh sách tất cả các phòng
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. [READ ONE] Lấy chi tiết 1 phòng theo ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    }
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 4. [UPDATE] Cập nhật thông tin phòng
exports.updateRoom = async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    if (!updatedRoom) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    }
    return res.status(200).json({ success: true, message: "Cập nhật thành công", data: updatedRoom });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 5. [DELETE] Xóa phòng
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    }
    return res.status(200).json({ success: true, message: "Đã xóa phòng thành công" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
