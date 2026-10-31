const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Quản lý hóa đơn & thanh toán (UC08, UC09, UC10)
router.get('/invoices', invoiceController.getInvoices);
router.post('/invoices/generate', invoiceController.generateMonthlyInvoice);
router.get('/invoices/:id', invoiceController.getInvoiceById);
router.post('/invoices/:id/pay-cash', invoiceController.payCash);
router.put('/invoices/:id/payment', invoiceController.payCash); // Hỗ trợ PUT /api/invoices/:id/payment theo yêu cầu
router.put('/invoices/:id', invoiceController.updateInvoice);
router.delete('/invoices/:id', invoiceController.deleteInvoice);

module.exports = router;
