const mongoose = require('mongoose');

// «entity» Room - Mô hình dữ liệu phòng trọ
const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  basePrice: { 
    type: Number, 
    required: true 
  },
  maxOccupants: { 
    type: Number, 
    default: 2 
  },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE'], 
    default: 'AVAILABLE' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
