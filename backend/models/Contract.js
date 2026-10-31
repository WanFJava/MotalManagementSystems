const mongoose = require('mongoose');

// «entity» Contract - Hợp đồng thuê phòng
const contractSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tenantName: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  depositAmount: {
    type: Number,
    required: true
  },
  rentalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED'],
    default: 'ACTIVE' // Mặc định là ACTIVE khi lập hợp đồng
  }
}, { 
  collection: 'contracts',
  timestamps: true 
});

// Đồng bộ giữa roomId và room trước khi lưu
contractSchema.pre('validate', function(next) {
  if (this.roomId && !this.room) {
    this.room = this.roomId;
  }
  if (this.room && !this.roomId) {
    this.roomId = this.room;
  }
  if (!this.roomId && !this.room) {
    return next(new Error('Phải cung cấp roomId hoặc room'));
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
