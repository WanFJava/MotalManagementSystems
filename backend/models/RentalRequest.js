const mongoose = require('mongoose');

// «entity» RentalRequest - Yêu cầu thuê phòng
const rentalRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  tenantName: {
    type: String,
    required: true
  },
  tenantPhone: {
    type: String,
    default: ''
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  expectedMoveInDate: {
    type: Date
  },
  note: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  }
}, { 
  collection: 'rentalRequests',
  timestamps: true 
});

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);

