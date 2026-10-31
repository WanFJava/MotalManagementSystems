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

  // Ngày ký kết hợp đồng
  signedDate: {
    type: Date,
    default: Date.now
  },

  // Thông tin Bên cho thuê (Bên A - Chủ nhà)
  landlordName: {
    type: String,
    default: 'Chủ nhà'
  },
  landlordDob: {
    type: Date,
    default: null
  },
  landlordCccd: {
    type: String,
    default: ''
  },
  landlordAddress: {
    type: String,
    default: ''
  },
  landlordPhone: {
    type: String,
    default: ''
  },
  landlordWorkplace: {
    type: String,
    default: ''
  },

  // Thông tin Bên thuê (Bên B - Khách trọ)
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
  tenantPhone: {
    type: String,
    default: ''
  },
  tenantCccd: {
    type: String,
    default: ''
  },
  tenantIdentityNumber: {
    type: String,
    default: ''
  },
  tenantDob: {
    type: Date,
    default: null
  },
  tenantDateOfBirth: {
    type: Date,
    default: null
  },
  tenantAddress: {
    type: String,
    default: ''
  },
  tenantHometown: {
    type: String,
    default: ''
  },
  tenantWorkplace: {
    type: String,
    default: ''
  },
  tenantGender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    default: 'OTHER'
  },
  tenantIdentityIssuedDate: {
    type: Date,
    default: null
  },
  tenantIdentityIssuedPlace: {
    type: String,
    default: ''
  },

  // Thời hạn & Tài chính
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

// Đồng bộ giữa roomId và room và các trường định danh trước khi lưu
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
  if (this.tenantIdentityNumber && !this.tenantCccd) {
    this.tenantCccd = this.tenantIdentityNumber;
  }
  if (this.tenantCccd && !this.tenantIdentityNumber) {
    this.tenantIdentityNumber = this.tenantCccd;
  }
  if (this.tenantDateOfBirth && !this.tenantDob) {
    this.tenantDob = this.tenantDateOfBirth;
  }
  if (this.tenantDob && !this.tenantDateOfBirth) {
    this.tenantDateOfBirth = this.tenantDob;
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
