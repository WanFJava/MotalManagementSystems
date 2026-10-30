const mongoose = require('mongoose');

/**
 * «entity» Room - Mô hình dữ liệu phòng trọ trong CSDL MongoDB
 * Phân hệ đảm nhiệm: Thành viên 1 - Quang (Room Management)
 * SWR1.1, SWR1.2, SWR1.3, SWR1.4
 */
const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: [true, 'Số phòng là bắt buộc!'], 
    unique: true,
    trim: true
  },
  basePrice: { 
    type: Number, 
    required: [true, 'Đơn giá thuê cơ bản là bắt buộc!'],
    min: [1, 'Đơn giá thuê phải lớn hơn 0!']
  },
  area: {
    type: Number,
    required: [true, 'Diện tích phòng là bắt buộc!'],
    default: 20,
    min: [5, 'Diện tích phòng tối thiểu là 5m²']
  },
  maxOccupants: { 
    type: Number, 
    default: 2,
    min: [1, 'Số người tối đa phải từ 1 người trở lên']
  },
  amenities: {
    type: [String],
    default: ['Wifi', 'Bình nóng lạnh', 'Điều hòa']
  },
  status: { 
    type: String, 
    enum: {
      values: ['AVAILABLE', 'RENTED', 'MAINTENANCE'],
      message: 'Trạng thái phòng phải là: AVAILABLE, RENTED hoặc MAINTENANCE'
    },
    default: 'AVAILABLE' 
  },
  description: {
    type: String,
    default: 'Phòng trọ đầy đủ tiện nghi, an ninh tốt, giờ giấc tự do.'
  },
  images: {
    type: [String],
    default: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
    ]
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Room', roomSchema);
