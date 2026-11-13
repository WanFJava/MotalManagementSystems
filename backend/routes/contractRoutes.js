const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

// Quản lý hợp đồng (Contract CRUD)
router.post('/contracts', contractController.createContract); // UC05: Lập hợp đồng mới
router.get('/contracts', contractController.getAllContracts); // Xem danh sách hợp đồng
router.get('/contracts/:id', contractController.getContractById); // Xem chi tiết hợp đồng
router.put('/contracts/:id/extend', contractController.extendContract); // UC05.1: Gia hạn hợp đồng
router.put('/contracts/:id/terminate', contractController.terminateContract); // UC05.2: Thanh lý hợp đồng
router.put('/contracts/:id/sign', contractController.signContract); // Ký tên online xác nhận hợp đồng (Khách thuê Bên B)

module.exports = router;
