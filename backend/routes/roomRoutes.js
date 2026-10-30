const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

/**
 * «boundary» Routes cho phân hệ Room Management
 * Phân hệ đảm nhiệm: Thành viên 1 - Quang (Room Management)
 */

// 1. [CREATE] Tạo mới phòng
router.post('/rooms', roomController.createRoom);

// 2. [SEARCH] Tìm kiếm và lọc phòng đa tiêu chí (UC02 - Phải đặt trước route /:id)
router.get('/rooms/search', roomController.searchRooms);

// 3. [READ ALL] Lấy danh sách tất cả các phòng
router.get('/rooms', roomController.getAllRooms);

// 4. [READ ONE] Lấy chi tiết một phòng theo ID
router.get('/rooms/:id', roomController.getRoomById);

// 5. [UPDATE] Cập nhật thông tin phòng theo ID
router.put('/rooms/:id', roomController.updateRoom);

// 6. [DELETE] Xóa phòng theo ID
router.delete('/rooms/:id', roomController.deleteRoom);

// 7. [RENTAL REQUEST] Gửi yêu cầu thuê phòng (Phối hợp UC03)
router.post('/rooms/:id/rental-request', roomController.submitRentalRequest);

module.exports = router;
