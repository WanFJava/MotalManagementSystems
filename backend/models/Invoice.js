const mongoose = require('mongoose');

// «entity» Invoice - Hóa đơn tiền trọ hàng tháng
const invoiceSchema = new mongoose.Schema({
  invoiceCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  tenantName: {
    type: String,
    required: [true, 'Tên khách thuê không được để trống']
  },
  tenantPhone: {
    type: String,
    default: ''
  },
  month: {
    type: String, // Định dạng "YYYY-MM", ví dụ "2026-10"
    required: [true, 'Tháng hóa đơn không được để trống']
  },
  // Các khoản mục chi phí
  roomAmount: {
    type: Number,
    required: [true, 'Tiền phòng không được để trống'],
    min: [0, 'Tiền phòng không được âm']
  },
  oldElec: {
    type: Number,
    default: 0
  },
  newElec: {
    type: Number,
    default: 0
  },
  electricUsage: {
    type: Number,
    default: 0
  },
  electricPrice: {
    type: Number,
    default: 3500 // 3.500 đ/kWh
  },
  electricAmount: {
    type: Number,
    default: 0
  },
  oldWater: {
    type: Number,
    default: 0
  },
  newWater: {
    type: Number,
    default: 0
  },
  waterUsage: {
    type: Number,
    default: 0
  },
  waterPrice: {
    type: Number,
    default: 20000 // 20.000 đ/m3
  },
  waterAmount: {
    type: Number,
    default: 0
  },
  internetFee: {
    type: Number,
    default: 100000 // Mạng Internet: 100.000 đ/tháng
  },
  garbageFee: {
    type: Number,
    default: 50000 // Tiền rác & vệ sinh: 50.000 đ/tháng
  },
  otherFees: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền không được âm']
  },
  status: {
    type: String,
    enum: ['UNPAID', 'PAID', 'OVERDUE'],
    default: 'UNPAID'
  },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Mặc định 7 ngày sau khi lập
  },
  paymentMethod: {
    type: String,
    enum: ['NONE', 'CASH', 'VNPAY'],
    default: 'NONE'
  },
  paidAt: {
    type: Date,
    default: null
  },
  note: {
    type: String,
    default: ''
  }
}, {
  collection: 'invoices',
  timestamps: true
});

// Đồng bộ roomId/room, contractId/contract và tự động tính toán tổng tiền
invoiceSchema.pre('validate', function(next) {
  if (this.roomId && !this.room) this.room = this.roomId;
  if (this.room && !this.roomId) this.roomId = this.room;
  if (this.contractId && !this.contract) this.contract = this.contractId;
  if (this.contract && !this.contractId) this.contractId = this.contract;

  // Tính tiền điện
  if (this.electricUsage !== undefined && this.electricPrice !== undefined) {
    this.electricAmount = Math.round(this.electricUsage * this.electricPrice);
  }

  // Tính tiền nước
  if (this.waterUsage !== undefined && this.waterPrice !== undefined) {
    this.waterAmount = Math.round(this.waterUsage * this.waterPrice);
  }

  // Tự động tính tổng tiền nếu chưa có hoặc cập nhật: SWR4.3
  const computedTotal = (this.roomAmount || 0) +
                        (this.electricAmount || 0) +
                        (this.waterAmount || 0) +
                        (this.internetFee || 0) +
                        (this.garbageFee || 0) +
                        (this.otherFees || 0);

  if (this.totalAmount === undefined || this.totalAmount === null || this.isModified('roomAmount') || this.isModified('electricAmount') || this.isModified('waterAmount')) {
    this.totalAmount = computedTotal;
  }

  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
