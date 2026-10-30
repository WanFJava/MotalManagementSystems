const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Quản lý thanh toán VNPay Sandbox (UC09)
router.post('/payment/create-payment-url', paymentController.createVNPayUrl);
router.get('/payment/vnpay-return', paymentController.vnpayReturn);
router.get('/payment/vnpay-ipn', paymentController.vnpayIpn);
router.get('/payment/transactions', paymentController.getTransactions);

module.exports = router;
