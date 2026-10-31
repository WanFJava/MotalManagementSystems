const utilityInvoiceService = require('../services/utilityInvoiceService');
const PaymentTransaction = require('../models/PaymentTransaction');

// Tạo URL thanh toán VNPay Sandbox (UC09)
exports.createVNPayUrl = async (req, res) => {
  try {
    const { invoiceId, returnUrl } = req.body;
    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã định danh hóa đơn (invoiceId)',
        data: null
      });
    }

    const ipAddr = req.headers['x-forwarded-for'] ||
                   req.connection.remoteAddress ||
                   req.socket.remoteAddress ||
                   '127.0.0.1';

    const result = await utilityInvoiceService.createVNPayUrl(invoiceId, ipAddr, returnUrl);
    res.status(200).json({
      success: true,
      message: 'Tạo URL thanh toán VNPay thành công',
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

// Xử lý VNPay Return URL (Khách quay lại từ cổng VNPay Sandbox)
exports.vnpayReturn = async (req, res) => {
  try {
    const result = await utilityInvoiceService.processVNPayCallback(req.query);
    res.status(200).json({
      success: result.success,
      message: result.message,
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

// Xử lý Webhook IPN từ VNPay Server gửi về
exports.vnpayIpn = async (req, res) => {
  try {
    const result = await utilityInvoiceService.processVNPayCallback(req.query);
    if (result.success) {
      // VNPay quy định chuẩn phản hồi cho IPN: RspCode '00'
      res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      res.status(200).json({ RspCode: '01', Message: 'Order not found or payment failed' });
    }
  } catch (error) {
    res.status(200).json({ RspCode: '97', Message: error.message });
  }
};

// Lấy danh sách lịch sử giao dịch thanh toán
exports.getTransactions = async (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.query;
    const filter = {};
    if (invoiceId) filter.$or = [{ invoiceId }, { invoice: invoiceId }];
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const transactions = await PaymentTransaction.find(filter)
      .populate({
        path: 'invoice',
        populate: { path: 'room', select: 'roomNumber' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Tải danh sách giao dịch thành công',
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
