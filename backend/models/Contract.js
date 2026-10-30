const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
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
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
