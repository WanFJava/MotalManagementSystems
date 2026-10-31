const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'motel_secret_key_swd392_khanh_2026';

/**
 * «entity» User - Mô hình tài khoản & Hồ sơ khách thuê trong CSDL MongoDB
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 * SWR2.1, SWR2.2, SWR2.3, SWR2.4
 */
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc!'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc!'],
    unique: true,
    trim: true,
    match: [/^[0-9]{9,11}$/, 'Số điện thoại phải từ 9 đến 11 chữ số!']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc!'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ!']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc!'],
    minlength: [6, 'Mật khẩu tối thiểu phải có 6 ký tự!']
  },
  role: {
    type: String,
    enum: {
      values: ['TENANT', 'STAFF', 'MANAGER'],
      message: 'Vai trò phải là TENANT, STAFF hoặc MANAGER'
    },
    default: 'TENANT'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // --- Hồ sơ định danh khách thuê (Tenant Profile - SWR2.3 / UC06) ---
  identityNumber: {
    type: String,
    unique: true,
    sparse: true, // Cho phép null khi mới đăng ký tài khoản
    trim: true,
    match: [/^[0-9]{9,12}$/, 'Số CCCD/Hộ chiếu phải gồm 9 đến 12 chữ số!']
  },
  identityIssuedDate: {
    type: Date
  },
  identityIssuedPlace: {
    type: String,
    default: 'Cục Cảnh sát QLHC về TTXH'
  },
  identityCardFront: {
    type: String,
    default: ''
  },
  identityCardBack: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    default: 'MALE'
  },
  hometown: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  currentAddress: {
    type: String,
    trim: true,
    default: ''
  },
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  temporaryResidenceStatus: {
    type: String,
    enum: ['NOT_REGISTERED', 'PENDING', 'REGISTERED'],
    default: 'NOT_REGISTERED'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  }
}, {
  timestamps: true
});

// Mã hóa mật khẩu trước khi lưu (Pre-save hook)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// So khớp mật khẩu đăng nhập
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo JSON Web Token (JWT)
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      fullName: this.fullName,
      phone: this.phone,
      email: this.email,
      role: this.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Ẩn mật khẩu khi chuyển sang JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
