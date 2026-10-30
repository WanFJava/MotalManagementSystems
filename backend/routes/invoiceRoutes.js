const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Quản lý hóa đơn & thanh toán tiền mặt (UC08, UC10)
router.get('/invoices', invoiceController.getInvoices);
router.post('/invoices/generate', invoiceController.generateMonthlyInvoice);
router.get('/invoices/:id', invoiceController.getInvoiceById);
router.post('/invoices/:id/pay-cash', invoiceController.payCash);
router.put('/invoices/:id', invoiceController.updateInvoice);
router.delete('/invoices/:id', invoiceController.deleteInvoice);

module.exports = router;
