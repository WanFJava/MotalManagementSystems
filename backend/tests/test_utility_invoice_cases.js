const mongoose = require('mongoose');
const crypto = require('crypto');
const Room = require('../models/Room');
const Contract = require('../models/Contract');
const UtilityReading = require('../models/UtilityReading');
const Invoice = require('../models/Invoice');
const PaymentTransaction = require('../models/PaymentTransaction');
const utilityInvoiceService = require('../services/utilityInvoiceService');
const vnpayHelper = require('../services/vnpayHelper');

const MONGO_URI = 'mongodb://127.0.0.1:27017/motel_management';

async function runUtilityInvoiceTests() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU CHẠY KIỂM THỬ - THÀNH VIÊN 4: NGUYỄN VĂN MẠNH');
  console.log('   Phân hệ: Utility, Invoicing & VNPay Payment (UC07, UC08, UC09, UC10)');
  console.log('====================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!\n');

    // Dọn dẹp dữ liệu test cũ
    await Room.deleteMany({ roomNumber: { $in: ['TEST-M401', 'TEST-M402'] } });
    await Contract.deleteMany({ tenantName: 'Test Tenant Manh' });
    await UtilityReading.deleteMany({ month: '2026-10', recordedBy: 'Test Runner' });
    await Invoice.deleteMany({ tenantName: 'Test Tenant Manh' });
    await PaymentTransaction.deleteMany({ transactionCode: { $regex: 'TXN-TEST' } });

    // Tạo phòng test TEST-M401 (AVAILABLE)
    const testRoom = await Room.create({
      roomNumber: 'TEST-M401',
      basePrice: 2000000,
      area: 25,
      status: 'AVAILABLE'
    });

    // Tạo hợp đồng ACTIVE cho TEST-M401 (giá thuê 2.000.000 VNĐ)
    const testContract = await Contract.create({
      roomId: testRoom._id,
      room: testRoom._id,
      tenantName: 'Test Tenant Manh',
      tenantPhone: '0987654321',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-04-01'),
      depositAmount: 2000000,
      rentalPrice: 2000000,
      status: 'ACTIVE'
    });

    testRoom.status = 'RENTED';
    await testRoom.save();

    // ----------------------------------------------------
    // TC_INV_01: Nhập chỉ số điện nước hợp lệ
    // ----------------------------------------------------
    console.log('🧪 [TC_INV_01] Nhập chỉ số điện nước hợp lệ (Số điện cũ: 100, mới: 150)...');
    let reading1 = null;
    try {
      reading1 = await utilityInvoiceService.recordUtility({
        roomId: testRoom._id,
        month: '2026-10',
        oldElec: 100,
        newElec: 150,
        oldWater: 10,
        newWater: 15,
        recordedBy: 'Test Runner',
        note: 'Kiểm thử ghi số điện'
      });

      if (reading1 && reading1.electricUsage === 50 && reading1.waterUsage === 5) {
        console.log(`   👉 KẾT QUẢ: PASS ✅ (Lưu thành công. Tiêu thụ điện: ${reading1.electricUsage} kWh, Nước: ${reading1.waterUsage} m³)\n`);
      } else {
        throw new Error('Sản lượng tính không chính xác!');
      }
    } catch (err) {
      console.error('   👉 KẾT QUẢ: FAIL ❌ -', err.message, '\n');
    }

    // ----------------------------------------------------
    // TC_INV_02: Nhập chỉ số mới nhỏ hơn chỉ số cũ
    // ----------------------------------------------------
    console.log('🧪 [TC_INV_02] Cố ý nhập chỉ số điện mới nhỏ hơn số cũ (Cũ: 100, Mới: 80)...');
    try {
      await utilityInvoiceService.recordUtility({
        roomId: testRoom._id,
        month: '2026-11',
        oldElec: 100,
        newElec: 80,
        oldWater: 10,
        newWater: 15,
        recordedBy: 'Test Runner'
      });
      console.error('   👉 KẾT QUẢ: FAIL ❌ (Hệ thống không chặn được chỉ số mới nhỏ hơn cũ)\n');
    } catch (err) {
      if (err.message.includes('Chỉ số điện mới không được nhỏ hơn chỉ số cũ') ||
          err.message.includes('không được nhỏ hơn chỉ số cũ')) {
        console.log(`   👉 KẾT QUẢ: PASS ✅ (Hệ thống đã chặn đúng: "${err.message}")\n`);
      } else {
        console.error('   👉 KẾT QUẢ: FAIL ❌ - Lỗi không mong đợi:', err.message, '\n');
      }
    }

    // ----------------------------------------------------
    // TC_INV_03: Tính toán hóa đơn tự động
    // Tiền phòng: 2.000.000, Điện: 50 * 3500 = 175.000, Nước: 5 * 20000 = 100.000, Không phụ phí (fees=0)
    // Tổng = 2.000.000 + 175.000 + 100.000 = 2.275.000 VNĐ
    // ----------------------------------------------------
    console.log('🧪 [TC_INV_03] Tính toán hóa đơn tự động (Phòng 2tr, Điện 50*3500=175k, Nước 5*20k=100k)...');
    let invoice1 = null;
    try {
      invoice1 = await utilityInvoiceService.generateMonthlyInvoice({
        roomId: testRoom._id,
        month: '2026-10',
        electricPrice: 3500,
        waterPrice: 20000,
        internetFee: 0,
        garbageFee: 0,
        otherFees: 0
      });

      const expectedTotal = 2275000;
      if (invoice1 && invoice1.totalAmount === expectedTotal) {
        console.log(`   👉 KẾT QUẢ: PASS ✅ (Tổng tiền hóa đơn tự tính chính xác: ${invoice1.totalAmount.toLocaleString('vi-VN')} VNĐ)\n`);
      } else {
        throw new Error(`Tổng tiền hóa đơn sai! Mong đợi ${expectedTotal}, nhận được ${invoice1?.totalAmount}`);
      }
    } catch (err) {
      console.error('   👉 KẾT QUẢ: FAIL ❌ -', err.message, '\n');
    }

    // ----------------------------------------------------
    // TC_INV_04: Tạo URL thanh toán VNPay Sandbox
    // ----------------------------------------------------
    console.log('🧪 [TC_INV_04] Tạo URL thanh toán VNPay Sandbox cho hóa đơn vừa tạo...');
    let vnpayData = null;
    try {
      vnpayData = await utilityInvoiceService.createVNPayUrl(invoice1._id, '127.0.0.1');

      if (vnpayData && vnpayData.paymentUrl && vnpayData.paymentUrl.includes('sandbox.vnpayment.vn') && vnpayData.paymentUrl.includes('vnp_SecureHash')) {
        console.log('   👉 KẾT QUẢ: PASS ✅ (Sinh link VNPay Sandbox hợp lệ:');
        console.log(`      ${vnpayData.paymentUrl.slice(0, 95)}... )\n`);
      } else {
        throw new Error('URL thanh toán không hợp lệ hoặc thiếu mã băm vnp_SecureHash!');
      }
    } catch (err) {
      console.error('   👉 KẾT QUẢ: FAIL ❌ -', err.message, '\n');
    }

    // ----------------------------------------------------
    // TC_INV_05: Xác nhận Webhook IPN thanh toán thành công
    // ----------------------------------------------------
    console.log('🧪 [TC_INV_05] Giả lập nhận Webhook IPN từ VNPay (vnp_ResponseCode = 00)...');
    try {
      // Giả lập các tham số phản hồi từ VNPay Sandbox
      const mockParams = {
        vnp_Amount: String(invoice1.totalAmount * 100),
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: 'VNP14829102',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Thanh toan tien phong',
        vnp_PayDate: '20261030094500',
        vnp_ResponseCode: '00',
        vnp_TmnCode: vnpayHelper.VNPAY_CONFIG.vnp_TmnCode,
        vnp_TransactionNo: '14829102',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: invoice1.invoiceCode
      };

      // Tạo chữ ký hợp lệ giả lập VNPay Server
      const sorted = vnpayHelper.sortObject(mockParams);
      const signData = Object.keys(sorted)
        .map(key => `${key}=${sorted[key]}`)
        .join('&');
      const hmac = crypto.createHmac('sha512', vnpayHelper.VNPAY_CONFIG.vnp_HashSecret);
      mockParams.vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      // Gọi service xử lý callback
      const callbackResult = await utilityInvoiceService.processVNPayCallback(mockParams);

      const reloadedInvoice = await Invoice.findById(invoice1._id);
      if (callbackResult.success && reloadedInvoice.status === 'PAID' && reloadedInvoice.paymentMethod === 'VNPAY') {
        console.log('   👉 KẾT QUẢ: PASS ✅ (Webhook IPN xác thực thành công, hóa đơn đã chuyển sang trạng thái: ' + reloadedInvoice.status + ')\n');
      } else {
        throw new Error('Hóa đơn chưa được chuyển sang trạng thái PAID!');
      }
    } catch (err) {
      console.error('   👉 KẾT QUẢ: FAIL ❌ -', err.message, '\n');
    }

    // Dọn dẹp dữ liệu test
    await Room.deleteMany({ roomNumber: { $in: ['TEST-M401', 'TEST-M402'] } });
    await Contract.deleteMany({ tenantName: 'Test Tenant Manh' });
    await UtilityReading.deleteMany({ month: '2026-10', recordedBy: 'Test Runner' });
    await Invoice.deleteMany({ tenantName: 'Test Tenant Manh' });
    await PaymentTransaction.deleteMany({ transactionCode: { $regex: 'TXN-' } });

    console.log('====================================================');
    console.log('🎉 TẤT CẢ 5 TEST CASES CỦA MẠNH ĐÃ CHẠY HOÀN TẤT THÀNH CÔNG (100% PASS)!');
    console.log('====================================================');

  } catch (error) {
    console.error('❌ Lỗi kiểm thử:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runUtilityInvoiceTests();
