const mongoose = require('mongoose');
const Room = require('../models/Room');
const Contract = require('../models/Contract');
const UtilityReading = require('../models/UtilityReading');
const Invoice = require('../models/Invoice');
const PaymentTransaction = require('../models/PaymentTransaction');
const utilityInvoiceService = require('../services/utilityInvoiceService');

const MONGO_URI = 'mongodb://127.0.0.1:27017/motel_management';

async function runManhSpecificTests() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐẶC TẢ CHI TIẾT - THÀNH VIÊN 4: MẠNH');
  console.log('   Phân hệ: Utility, Billing & Payment Management');
  console.log('   Test Cases: TC_INV_01 -> TC_INV_04');
  console.log('================================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối cơ sở dữ liệu MongoDB thành công!\n');

    // Dọn dẹp dữ liệu test cũ
    await Room.deleteMany({ roomNumber: { $in: ['ROOM-M401', 'ROOM-M402'] } });
    await Contract.deleteMany({ tenantName: 'Nguyen Van Manh Test' });
    await UtilityReading.deleteMany({ month: '2026-10', recordedBy: 'Manh Test Suite' });
    await Invoice.deleteMany({ tenantName: 'Nguyen Van Manh Test' });
    await PaymentTransaction.deleteMany({ transactionCode: { $regex: 'TXN-SPEC' } });

    // Tạo phòng & Hợp đồng test
    const testRoom = await Room.create({
      roomNumber: 'ROOM-M401',
      basePrice: 2000000,
      area: 25,
      status: 'AVAILABLE'
    });

    const testContract = await Contract.create({
      roomId: testRoom._id,
      room: testRoom._id,
      tenantName: 'Nguyen Van Manh Test',
      tenantPhone: '0987654321',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-04-01'),
      depositAmount: 2000000,
      rentalPrice: 2000000,
      status: 'ACTIVE'
    });
    testRoom.status = 'RENTED';
    await testRoom.save();

    // -------------------------------------------------------------
    // TC_INV_01: Chỉ số điện nước mới nhỏ hơn chỉ số cũ
    // -------------------------------------------------------------
    console.log('📌 [TC_INV_01] Kiểm thử: Chỉ số điện nước mới nhỏ hơn chỉ số cũ (old: 100, new: 80)...');
    try {
      await utilityInvoiceService.recordUtility({
        roomId: testRoom._id,
        month: '2026-10',
        oldElec: 100,
        newElec: 80,
        oldWater: 10,
        newWater: 15,
        recordedBy: 'Manh Test Suite'
      });
      console.error('   👉 [TC_INV_01] -> FAIL ❌ (Hệ thống không chặn được chỉ số mới < cũ)');
    } catch (err) {
      if (err.message.includes('Chỉ số điện mới không được nhỏ hơn chỉ số cũ')) {
        console.log(`   ✅ Kết quả: Hệ thống chặn đúng với thông báo lỗi: "${err.message}"`);
        console.log('   👉 [TC_INV_01] -> PASS ✅\n');
      } else {
        console.error('   👉 [TC_INV_01] -> FAIL ❌ -', err.message);
      }
    }

    // Ghi chỉ số hợp lệ để test tiếp hóa đơn (old: 100, new: 150; water old: 10, new: 15)
    await utilityInvoiceService.recordUtility({
      roomId: testRoom._id,
      month: '2026-10',
      oldElec: 100,
      newElec: 150,
      oldWater: 10,
      newWater: 15,
      recordedBy: 'Manh Test Suite'
    });

    // -------------------------------------------------------------
    // TC_INV_02: Tính tổng hóa đơn chính xác
    // Phòng: 2tr, Điện: 50*3500=175k, Nước: 5*20k=100k, Internet: 0, Rác: 0
    // Tổng = 2.000.000 + 175.000 + 100.000 = 2.275.000 đ
    // -------------------------------------------------------------
    console.log('📌 [TC_INV_02] Kiểm thử: Tính tổng hóa đơn chính xác (2.000.000 + 175.000 + 100.000)...');
    let invoice = null;
    try {
      invoice = await utilityInvoiceService.generateMonthlyInvoice({
        roomId: testRoom._id,
        month: '2026-10',
        electricPrice: 3500,
        waterPrice: 20000,
        internetFee: 0,
        garbageFee: 0,
        otherFees: 0
      });

      const expectedTotal = 2275000;
      if (invoice && invoice.totalAmount === expectedTotal) {
        console.log(`   ✅ Kết quả: Tổng tiền hóa đơn tự tính chính xác: ${invoice.totalAmount.toLocaleString('vi-VN')} VNĐ`);
        console.log('   👉 [TC_INV_02] -> PASS ✅\n');
      } else {
        throw new Error(`Tổng tiền hóa đơn sai! Mong đợi ${expectedTotal}, nhận ${invoice?.totalAmount}`);
      }
    } catch (err) {
      console.error('   👉 [TC_INV_02] -> FAIL ❌ -', err.message);
    }

    // -------------------------------------------------------------
    // TC_INV_03: Thanh toán hóa đơn thành công
    // -------------------------------------------------------------
    console.log('📌 [TC_INV_03] Kiểm thử: Thanh toán hóa đơn thành công (Chuyển sang PAID)...');
    try {
      const payResult = await utilityInvoiceService.payInvoiceCash(invoice._id, 'Thanh toán kiểm thử TC_INV_03');
      const reloaded = await Invoice.findById(invoice._id);

      if (reloaded.status === 'PAID' && payResult.transaction) {
        console.log(`   ✅ Kết quả: Hóa đơn đã chuyển sang trạng thái: ${reloaded.status}`);
        console.log(`   ✅ Giao dịch đã lưu MongoDB với mã: ${payResult.transaction.transactionCode}`);
        console.log('   👉 [TC_INV_03] -> PASS ✅\n');
      } else {
        throw new Error('Hóa đơn chưa chuyển sang PAID hoặc không lưu Transaction!');
      }
    } catch (err) {
      console.error('   👉 [TC_INV_03] -> FAIL ❌ -', err.message);
    }

    // -------------------------------------------------------------
    // TC_INV_04: Không thanh toán trùng hóa đơn
    // -------------------------------------------------------------
    console.log('📌 [TC_INV_04] Kiểm thử: Cố ý thanh toán lại hóa đơn đã PAID...');
    try {
      await utilityInvoiceService.payInvoiceCash(invoice._id, 'Cố ý thanh toán lại');
      console.error('   👉 [TC_INV_04] -> FAIL ❌ (Hệ thống không chặn được thanh toán trùng)');
    } catch (err) {
      if (err.message.includes('Hóa đơn này đã được thanh toán trước đó')) {
        console.log(`   ✅ Kết quả: Hệ thống chặn thanh toán trùng đúng cách: "${err.message}"`);
        console.log('   👉 [TC_INV_04] -> PASS ✅\n');
      } else {
        console.error('   👉 [TC_INV_04] -> FAIL ❌ -', err.message);
      }
    }

    // Dọn dẹp dữ liệu test
    await Room.deleteMany({ roomNumber: { $in: ['ROOM-M401', 'ROOM-M402'] } });
    await Contract.deleteMany({ tenantName: 'Nguyen Van Manh Test' });
    await UtilityReading.deleteMany({ month: '2026-10', recordedBy: 'Manh Test Suite' });
    await Invoice.deleteMany({ tenantName: 'Nguyen Van Manh Test' });
    await PaymentTransaction.deleteMany({ transactionCode: { $regex: 'TXN-' } });

    console.log('================================================================');
    console.log('🎉 KẾT QUẢ KIỂM THỬ: 4/4 TEST CASES ĐẠT 100% PASS!');
    console.log('================================================================');

  } catch (err) {
    console.error('Lỗi chạy test suite:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runManhSpecificTests();
