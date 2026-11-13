const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'motel_secret_key_swd392_khanh_2026';

/**
 * Middleware xác thực JSON Web Token (JWT)
 * SWR2.2: Kiểm tra tính hợp lệ của token và nạp thông tin user vào req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập hoặc thiếu Token xác thực!'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại trên hệ thống!'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Quản lý.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn!',
      error: error.message
    });
  }
};

/**
 * Middleware phân quyền vai trò (Role-based Authorization)
 * @param  {...string} roles - Danh sách vai trò được phép (VD: 'MANAGER', 'STAFF')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập trước khi thực hiện thao tác này!'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện hành động này! Quyền yêu cầu: [${roles.join(', ')}], quyền hiện tại: [${req.user.role}]`
      });
    }

    next();
  };
};

/**
 * Middleware tùy chọn xác thực Token (nếu có Bearer thì nạp user, nếu không thì tiếp tục)
 */
const optionalVerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Không chặn nếu token lỗi, chỉ không gán req.user
  }
  next();
};

module.exports = {
  verifyToken,
  requireRole,
  optionalVerifyToken
};
