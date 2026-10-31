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
  oldElec: {
    type: Number,
    required: [true, 'Chỉ số điện cũ không được để trống'],
    min: [0, 'Chỉ số điện cũ không được âm']
  },
  newElec: {
    type: Number,
    required: [true, 'Chỉ số điện mới không được để trống'],
    min: [0, 'Chỉ số điện mới không được âm']
  },
  oldWater: {
    type: Number,
    required: [true, 'Chỉ số nước cũ không được để trống'],
    min: [0, 'Chỉ số nước cũ không được âm']
  },
  newWater: {
    type: Number,
    required: [true, 'Chỉ số nước mới không được để trống'],
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

// Đồng bộ roomId và room, tính toán lượng tiêu thụ và validate chỉ số mới >= cũ
utilityReadingSchema.pre('validate', function(next) {
  if (this.roomId && !this.room) {
    this.room = this.roomId;
  }
  if (this.room && !this.roomId) {
    this.roomId = this.room;
  }
  if (!this.roomId && !this.room) {
    return next(new Error('Phải cung cấp roomId hoặc room'));
  }

  // Ràng buộc nghiệp vụ: Chỉ số mới không được nhỏ hơn chỉ số cũ (SWR4.2)
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
