const UtilityReading = require('../models/UtilityReading');
const Invoice = require('../models/Invoice');
const PaymentTransaction = require('../models/PaymentTransaction');
const Room = require('../models/Room');
const Contract = require('../models/Contract');
const vnpayHelper = require('./vnpayHelper');

class UtilityInvoiceService {
  /**
   * UC07: Ghi chỉ số điện nước hàng tháng (SWR4.1, SWR4.2)
   */
  async recordUtility({ roomId, month, oldElec, newElec, oldWater, newWater, recordedBy, note }) {
    if (!roomId) {
      throw new Error('Vui lòng chọn phòng trọ để ghi chỉ số');
    }
    if (!month) {
      throw new Error('Vui lòng chọn tháng ghi chỉ số');
    }

    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Không tìm thấy thông tin phòng trọ');
    }

    // Kiểm tra chỉ số hợp lệ: SWR4.2 / TC_INV_02
    if (Number(newElec) < Number(oldElec)) {
      throw new Error('Chỉ số điện mới không được nhỏ hơn chỉ số cũ');
    }
    if (Number(newWater) < Number(oldWater)) {
      throw new Error('Chỉ số nước mới không được nhỏ hơn chỉ số cũ');
    }

    // Kiểm tra nếu tháng này đã ghi chỉ số rồi thì cập nhật, chưa thì tạo mới
    let reading = await UtilityReading.findOne({
      $or: [{ roomId }, { room: roomId }],
      month
    });

    if (reading) {
      reading.oldElec = Number(oldElec);
      reading.newElec = Number(newElec);
      reading.oldWater = Number(oldWater);
      reading.newWater = Number(newWater);
      reading.electricUsage = Number(newElec) - Number(oldElec);
      reading.waterUsage = Number(newWater) - Number(oldWater);
      reading.recordedBy = recordedBy || reading.recordedBy;
      reading.note = note !== undefined ? note : reading.note;
      reading.readingDate = new Date();
      await reading.save();
    } else {
      reading = await UtilityReading.create({
        roomId: room._id,
        room: room._id,
        month,
        oldElec: Number(oldElec),
        newElec: Number(newElec),
        oldWater: Number(oldWater),
        newWater: Number(newWater),
        electricUsage: Number(newElec) - Number(oldElec),
        waterUsage: Number(newWater) - Number(oldWater),
        recordedBy: recordedBy || 'Nhân viên quản lý',
        note: note || ''
      });
    }

    return reading;
  }

  /**
   * Lấy danh sách chỉ số điện nước đã ghi
   */
  async getUtilityReadings({ roomId, month }) {
    const filter = {};
    if (roomId) {
      filter.$or = [{ roomId }, { room: roomId }];
    }
    if (month) {
      filter.month = month;
    }
    return await UtilityReading.find(filter)
      .populate('room', 'roomNumber basePrice status')
      .sort({ createdAt: -1 });
  }

  /**
   * Lấy chỉ số mới nhất của 1 phòng (để gợi ý số cũ cho tháng kế tiếp)
   */
  async getLatestUtility(roomId) {
    return await UtilityReading.findOne({
      $or: [{ roomId }, { room: roomId }]
    }).sort({ month: -1, createdAt: -1 });
  }

  /**
   * UC08: Lập hóa đơn hàng tháng (SWR4.3 / TC_INV_03)
   * Ràng buộc nghiệp vụ chéo: Chỉ tạo hóa đơn cho phòng đang có hợp đồng ACTIVE
   */
  async generateMonthlyInvoice({ roomId, month, electricPrice = 3500, waterPrice = 20000, internetFee = 100000, garbageFee = 50000, otherFees = 0, note = '' }) {
    if (!roomId || !month) {
      throw new Error('Vui lòng cung cấp mã phòng và tháng lập hóa đơn');
    }

    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Không tìm thấy thông tin phòng trọ');
    }

    // 1. Kiểm tra hợp đồng ACTIVE (Quy ước Team Working Agreement Phần 4)
    const activeContract = await Contract.findOne({
      $or: [{ roomId: room._id }, { room: room._id }],
      status: 'ACTIVE'
    });

    if (!activeContract) {
      throw new Error(`Phòng ${room.roomNumber} hiện không có hợp đồng thuê có hiệu lực (ACTIVE)! Không thể lập hóa đơn.`);
    }

    // 2. Kiểm tra nếu đã có hóa đơn tháng này
    const existingInvoice = await Invoice.findOne({
      $or: [{ roomId: room._id }, { room: room._id }],
      month
    });
    if (existingInvoice) {
      throw new Error(`Phòng ${room.roomNumber} đã được lập hóa đơn cho tháng ${month}! Mã: ${existingInvoice.invoiceCode}`);
    }

    // 3. Lấy chỉ số điện nước của tháng này (nếu có)
    const utility = await UtilityReading.findOne({
      $or: [{ roomId: room._id }, { room: room._id }],
      month
    });

    const oldElec = utility ? utility.oldElec : 0;
    const newElec = utility ? utility.newElec : 0;
    const electricUsage = utility ? utility.electricUsage : 0;

    const oldWater = utility ? utility.oldWater : 0;
    const newWater = utility ? utility.newWater : 0;
    const waterUsage = utility ? utility.waterUsage : 0;

    // Tiền phòng lấy từ thỏa thuận trong Hợp đồng
    const roomAmount = Number(activeContract.rentalPrice || room.basePrice);
    const electricAmount = Math.round(Number(electricUsage) * Number(electricPrice));
    const waterAmount = Math.round(Number(waterUsage) * Number(waterPrice));
    const totalAmount = roomAmount + electricAmount + waterAmount + Number(internetFee) + Number(garbageFee) + Number(otherFees);

    // Sinh mã hóa đơn duy nhất
    const invoiceCode = `INV-${month.replace('-', '')}-${room.roomNumber}-${Date.now().toString().slice(-4)}`;

    const newInvoice = await Invoice.create({
      invoiceCode,
      roomId: room._id,
      room: room._id,
      contractId: activeContract._id,
      contract: activeContract._id,
      tenantName: activeContract.tenantName,
      tenantPhone: activeContract.tenantPhone || '',
      month,
      roomAmount,
      oldElec,
      newElec,
      electricUsage,
      electricPrice: Number(electricPrice),
      electricAmount,
      oldWater,
      newWater,
      waterUsage,
      waterPrice: Number(waterPrice),
      waterAmount,
      internetFee: Number(internetFee),
      garbageFee: Number(garbageFee),
      otherFees: Number(otherFees),
      totalAmount,
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      note
    });

    return await Invoice.findById(newInvoice._id)
      .populate('room', 'roomNumber basePrice')
      .populate('contract', 'tenantName rentalPrice startDate endDate');
  }

  /**
   * Lấy danh sách hóa đơn
   */
  async getAllInvoices({ status, month, roomId, tenantName }) {
    const filter = {};
    if (status) filter.status = status;
    if (month) filter.month = month;
    if (roomId) filter.$or = [{ roomId }, { room: roomId }];
    if (tenantName) filter.tenantName = { $regex: tenantName, $options: 'i' };

    return await Invoice.find(filter)
      .populate('room', 'roomNumber basePrice')
      .populate('contract', 'tenantName rentalPrice')
      .sort({ createdAt: -1 });
  }

  /**
   * Lấy chi tiết hóa đơn theo ID
   */
  async getInvoiceById(id) {
    const invoice = await Invoice.findById(id)
      .populate('room', 'roomNumber basePrice area')
      .populate('contract', 'tenantName depositAmount rentalPrice startDate endDate');
    if (!invoice) {
      throw new Error('Không tìm thấy thông tin hóa đơn');
    }
    return invoice;
  }

  /**
   * UC10: Xác nhận thu tiền mặt thủ công (SWR4.5)
   */
  async payInvoiceCash(invoiceId, note = 'Thu tiền mặt trực tiếp') {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Không tìm thấy hóa đơn cần thanh toán');
    }
    if (invoice.status === 'PAID') {
      throw new Error('Hóa đơn này đã được thanh toán trước đó!');
    }

    invoice.status = 'PAID';
    invoice.paymentMethod = 'CASH';
    invoice.paidAt = new Date();
    await invoice.save();

    // Ghi nhận lịch sử giao dịch
    const transactionCode = `TXN-CASH-${Date.now()}`;
    const transaction = await PaymentTransaction.create({
      invoiceId: invoice._id,
      invoice: invoice._id,
      transactionCode,
      amount: invoice.totalAmount,
      paymentMethod: 'CASH',
      status: 'SUCCESS',
      paidAt: new Date(),
      note: note || 'Xác nhận thu tiền mặt bởi nhân viên quản lý'
    });

    return { invoice, transaction };
  }

  /**
   * UC09: Tạo URL thanh toán VNPay Sandbox (SWR4.4 / TC_INV_04)
   */
  async createVNPayUrl(invoiceId, ipAddr = '127.0.0.1', returnUrl = null) {
    const invoice = await Invoice.findById(invoiceId).populate('room');
    if (!invoice) {
      throw new Error('Không tìm thấy hóa đơn để thanh toán');
    }
    if (invoice.status === 'PAID') {
      throw new Error('Hóa đơn này đã được thanh toán!');
    }

    const roomNumber = invoice.room ? invoice.room.roomNumber : '';
    const orderInfo = `Thanh toan tien phong ${roomNumber} thang ${invoice.month}`;

    const paymentUrl = vnpayHelper.createPaymentUrl({
      ipAddr,
      amount: invoice.totalAmount,
      orderInfo,
      orderId: invoice.invoiceCode,
      returnUrl
    });

    return {
      paymentUrl,
      invoiceCode: invoice.invoiceCode,
      totalAmount: invoice.totalAmount,
      orderInfo
    };
  }

  /**
   * UC09: Xử lý Webhook IPN / Callback từ VNPay Sandbox (SWR4.4 / TC_INV_05)
   */
  async processVNPayCallback(vnp_Params) {
    const verification = vnpayHelper.verifyReturnUrl(vnp_Params);
    if (!verification.isValid) {
      throw new Error('Chữ ký dữ liệu VNPay không hợp lệ (Checksum Failed)!');
    }

    const invoice = await Invoice.findOne({ invoiceCode: verification.orderId });
    if (!invoice) {
      throw new Error(`Không tìm thấy hóa đơn có mã: ${verification.orderId}`);
    }

    if (verification.isSuccess) {
      invoice.status = 'PAID';
      invoice.paymentMethod = 'VNPAY';
      invoice.paidAt = new Date();
      await invoice.save();

      // Lưu giao dịch VNPay
      const transactionCode = `TXN-VNP-${verification.transactionNo || Date.now()}`;
      let transaction = await PaymentTransaction.findOne({ transactionCode });
      if (!transaction) {
        transaction = await PaymentTransaction.create({
          invoiceId: invoice._id,
          invoice: invoice._id,
          transactionCode,
          amount: verification.amount || invoice.totalAmount,
          paymentMethod: 'VNPAY',
          bankCode: verification.bankCode || 'VNPAY',
          vnpayTxnRef: verification.orderId,
          vnpayTransactionNo: verification.transactionNo || '',
          vnpayResponseCode: verification.responseCode || '00',
          status: 'SUCCESS',
          paidAt: new Date(),
          note: `Thanh toán thành công qua VNPay (Mã GD: ${verification.transactionNo})`
        });
      }

      return {
        success: true,
        message: 'Thanh toán qua VNPay thành công, hóa đơn đã chuyển sang PAID!',
        invoice,
        transaction
      };
    } else {
      return {
        success: false,
        message: `Giao dịch VNPay thất bại hoặc bị hủy (Mã phản hồi: ${verification.responseCode})`,
        invoice
      };
    }
  }

  /**
   * Xóa hóa đơn (chỉ xóa khi chưa thanh toán UNPAID)
   */
  async deleteInvoice(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Không tìm thấy hóa đơn');
    }
    if (invoice.status === 'PAID') {
      throw new Error('Không thể xóa hóa đơn đã thanh toán (PAID)!');
    }
    await Invoice.findByIdAndDelete(invoiceId);
    return true;
  }
}

module.exports = new UtilityInvoiceService();
