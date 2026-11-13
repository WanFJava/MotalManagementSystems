const mongoose = require('mongoose');

// «entity» UtilityReading - Ghi chỉ số điện nước
const utilityReadingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  month: {
    type: String, // Định dạng "YYYY-MM", ví dụ "2026-10"
    required: [true, 'Tháng ghi chỉ số không được để trống']
  },
  // Hỗ trợ cả oldElectricIndex và oldElec
  oldElec: {
    type: Number,
    min: [0, 'Chỉ số điện cũ không được âm']
  },
  newElec: {
    type: Number,
    min: [0, 'Chỉ số điện mới không được âm']
  },
  oldWater: {
    type: Number,
    min: [0, 'Chỉ số nước cũ không được âm']
  },
  newWater: {
    type: Number,
    min: [0, 'Chỉ số nước mới không được âm']
  },
  oldElectricIndex: {
    type: Number,
    min: [0, 'Chỉ số điện cũ không được âm']
  },
  newElectricIndex: {
    type: Number,
    min: [0, 'Chỉ số điện mới không được âm']
  },
  oldWaterIndex: {
    type: Number,
    min: [0, 'Chỉ số nước cũ không được âm']
  },
  newWaterIndex: {
    type: Number,
    min: [0, 'Chỉ số nước mới không được âm']
  },
  electricUsage: {
    type: Number,
    default: 0
  },
  waterUsage: {
    type: Number,
    default: 0
  },
  readingDate: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: String,
    default: 'Nhân viên quản lý'
  },
  note: {
    type: String,
    default: ''
  }
}, {
  collection: 'utilities',
  timestamps: true
});

// Đồng bộ tên trường oldElec <-> oldElectricIndex, tính toán lượng tiêu thụ và validate chỉ số mới >= cũ
utilityReadingSchema.pre('validate', function(next) {
  if (this.roomId && !this.room) this.room = this.roomId;
  if (this.room && !this.roomId) this.roomId = this.room;
  if (!this.roomId && !this.room) {
    return next(new Error('Phải cung cấp roomId hoặc room'));
  }

  // Đồng bộ alias tên trường
  if (this.oldElectricIndex !== undefined && this.oldElec === undefined) this.oldElec = this.oldElectricIndex;
  if (this.oldElec !== undefined && this.oldElectricIndex === undefined) this.oldElectricIndex = this.oldElec;

  if (this.newElectricIndex !== undefined && this.newElec === undefined) this.newElec = this.newElectricIndex;
  if (this.newElec !== undefined && this.newElectricIndex === undefined) this.newElectricIndex = this.newElec;

  if (this.oldWaterIndex !== undefined && this.oldWater === undefined) this.oldWater = this.oldWaterIndex;
  if (this.oldWater !== undefined && this.oldWaterIndex === undefined) this.oldWaterIndex = this.oldWater;

  if (this.newWaterIndex !== undefined && this.newWater === undefined) this.newWater = this.newWaterIndex;
  if (this.newWater !== undefined && this.newWaterIndex === undefined) this.newWaterIndex = this.newWater;

  // Ràng buộc nghiệp vụ: Chỉ số mới không được nhỏ hơn chỉ số cũ (SWR4.2 / TC_INV_01)
  if (this.newElec !== undefined && this.oldElec !== undefined) {
    if (this.newElec < this.oldElec) {
      return next(new Error('Chỉ số điện mới không được nhỏ hơn chỉ số cũ'));
    }
    this.electricUsage = this.newElec - this.oldElec;
  }

  if (this.newWater !== undefined && this.oldWater !== undefined) {
    if (this.newWater < this.oldWater) {
      return next(new Error('Chỉ số nước mới không được nhỏ hơn chỉ số cũ'));
    }
    this.waterUsage = this.newWater - this.oldWater;
  }

  next();
});

module.exports = mongoose.model('UtilityReading', utilityReadingSchema);
