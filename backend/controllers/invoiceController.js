const utilityInvoiceService = require('../services/utilityInvoiceService');
const Invoice = require('../models/Invoice');

// Lập hóa đơn tự động theo tháng (UC08)
exports.generateMonthlyInvoice = async (req, res) => {
  try {
    const invoice = await utilityInvoiceService.generateMonthlyInvoice(req.body);
    res.status(201).json({
      success: true,
      message: 'Lập hóa đơn tiền trọ thành công!',
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Lấy danh sách hóa đơn
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await utilityInvoiceService.getAllInvoices(req.query);
    res.status(200).json({
      success: true,
      message: 'Tải danh sách hóa đơn thành công',
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Lấy chi tiết một hóa đơn
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await utilityInvoiceService.getInvoiceById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết hóa đơn thành công',
      data: invoice
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Xác nhận thanh toán tiền mặt (UC10)
exports.payCash = async (req, res) => {
  try {
    const { note } = req.body;
    const result = await utilityInvoiceService.payInvoiceCash(req.params.id, note);
    res.status(200).json({
      success: true,
      message: 'Xác nhận thu tiền mặt thành công! Hóa đơn đã chuyển sang trạng thái ĐÃ THANH TOÁN (PAID).',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Cập nhật hóa đơn thủ công
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn',
        data: null
      });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Không thể chỉnh sửa hóa đơn đã thanh toán!',
        data: null
      });
    }

    Object.assign(invoice, req.body);
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin hóa đơn thành công',
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Xóa hóa đơn
exports.deleteInvoice = async (req, res) => {
  try {
    await utilityInvoiceService.deleteInvoice(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Đã xóa hóa đơn thành công',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
