const mongoose = require('mongoose');
const Room = require('../models/Room');
const Contract = require('../models/Contract');
const UtilityReading = require('../models/UtilityReading');
const Invoice = require('../models/Invoice');

const MONGO_URI = 'mongodb://127.0.0.1:27017/motel_management';

async function seedUtilityAndInvoices() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB để nạp dữ liệu mẫu Hóa đơn & Điện nước...');

    // Tìm phòng 201
    let room201 = await Room.findOne({ roomNumber: '201' });
    if (!room201) {
      room201 = await Room.create({
        roomNumber: '201',
        basePrice: 3200000,
        area: 28,
        status: 'RENTED'
      });
    } else {
      room201.status = 'RENTED';
      await room201.save();
    }

    // Tìm hoặc tạo hợp đồng cho phòng 201
    let contract201 = await Contract.findOne({
      $or: [{ room: room201._id }, { roomId: room201._id }],
      status: 'ACTIVE'
    });

    if (!contract201) {
      contract201 = await Contract.create({
        roomId: room201._id,
        room: room201._id,
        tenantName: 'Nguyễn Thị Mai',
        tenantPhone: '0918889999',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-03-01'),
        depositAmount: 3200000,
        rentalPrice: 3200000,
        status: 'ACTIVE'
      });
    }

    // Nạp chỉ số điện nước mẫu tháng 2026-10
    await UtilityReading.findOneAndUpdate(
      { room: room201._id, month: '2026-10' },
      {
        roomId: room201._id,
        room: room201._id,
        month: '2026-10',
        oldElec: 120,
        newElec: 195,
        oldWater: 15,
        newWater: 22,
        electricUsage: 75,
        waterUsage: 7,
        recordedBy: 'Nguyễn Văn Mạnh',
        note: 'Chốt số cuối tháng 10/2026'
      },
      { upsert: true, new: true }
    );

    // Nạp hóa đơn mẫu tháng 2026-10
    const invoiceCode = `INV-202610-201-INIT`;
    const elecAmount = 75 * 3500; // 262.500 đ
    const waterAmount = 7 * 20000; // 140.000 đ
    const internetFee = 100000;
    const garbageFee = 50000;
    const totalAmount = 3200000 + elecAmount + waterAmount + internetFee + garbageFee; // 3.752.500 đ

    await Invoice.findOneAndUpdate(
      { invoiceCode },
      {
        invoiceCode,
        roomId: room201._id,
        room: room201._id,
        contractId: contract201._id,
        contract: contract201._id,
        tenantName: contract201.tenantName,
        tenantPhone: contract201.tenantPhone,
        month: '2026-10',
        roomAmount: 3200000,
        oldElec: 120,
        newElec: 195,
        electricUsage: 75,
        electricPrice: 3500,
        electricAmount: elecAmount,
        oldWater: 15,
        newWater: 22,
        waterUsage: 7,
        waterPrice: 20000,
        waterAmount: waterAmount,
        internetFee,
        garbageFee,
        otherFees: 0,
        totalAmount,
        status: 'UNPAID',
        dueDate: new Date('2026-11-05'),
        note: 'Hóa đơn tiền phòng & điện nước tháng 10/2026'
      },
      { upsert: true, new: true }
    );

    console.log('✅ Đã nạp thành công dữ liệu mẫu Hóa đơn & Điện nước cho phòng 201!');
  } catch (err) {
    console.error('❌ Lỗi seed hóa đơn:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedUtilityAndInvoices();
