const express = require('express');
const router = express.Router();
const rentalRequestController = require('../controllers/rentalRequestController');

// Quản lý yêu cầu thuê phòng (Rental Request API)
router.post('/rental-requests', rentalRequestController.createRentalRequest); // UC03: Gửi yêu cầu thuê phòng
router.get('/rental-requests', rentalRequestController.getAllRentalRequests); // Lấy danh sách yêu cầu
router.get('/rental-requests/:id', rentalRequestController.getRentalRequestById); // Chi tiết yêu cầu
router.put('/rental-requests/:id', rentalRequestController.updateRentalRequestStatus); // Duyệt/từ chối yêu cầu

module.exports = router;

