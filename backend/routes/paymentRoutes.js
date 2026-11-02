const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Quản lý thanh toán VNPay Sandbox & Payments chung (UC09)
router.post('/payments', paymentController.createVNPayUrl); // Hỗ trợ POST /api/payments theo yêu cầu
router.post('/payment/create-payment-url', paymentController.createVNPayUrl);
router.get('/payment/vnpay-return', paymentController.vnpayReturn);
router.get('/payment/vnpay-ipn', paymentController.vnpayIpn);
router.get('/payment/transactions', paymentController.getTransactions);

module.exports = router;
