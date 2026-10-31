const mongoose = require('mongoose');
const userService = require('../services/userService');

/**
 * «control» UserController - Tiếp nhận HTTP Request và phản hồi chuẩn API
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 */

// 1. [POST /api/auth/register] Đăng ký tài khoản (SWR2.1 / TC_USER_01)
exports.register = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 2. [POST /api/auth/login] Đăng nhập hệ thống (SWR2.2 / TC_USER_02)
exports.login = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: result
    });
  } catch (error) {
    const status = error.message.includes('Sai tài khoản hoặc mật khẩu') ? 401 : 400;
    return res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

// 3. [GET /api/auth/me] Lấy thông tin tài khoản hiện tại từ Token
exports.getMe = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công!',
      data: user
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// 4. [GET /api/users] Lấy danh sách tất cả người dùng (Có hỗ trợ lọc)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.query);
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 5. [GET /api/users/tenants] Lấy danh sách khách thuê (UC06)
exports.getTenants = async (req, res) => {
  try {
    const tenants = await userService.getTenants(req.query);
    return res.status(200).json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 6. [GET /api/users/staff] Lấy danh sách nhân viên & quản lý (UC15)
exports.getStaff = async (req, res) => {
  try {
    const staff = await userService.getStaffList(req.query);
    return res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 7. [GET /api/users/:id] Xem chi tiết 1 người dùng theo ID
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: `Định danh người dùng '${req.params.id}' không hợp lệ!`
      });
    }
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// 8. [POST /api/users/staff] Tạo tài khoản nhân viên mới (UC15 / Manager)
exports.createStaff = async (req, res) => {
  try {
    const newStaff = await userService.createStaff(req.body);
    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản nhân viên mới thành công!',
      data: newStaff
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 9. [PUT /api/users/:id/tenant-profile] Cập nhật hồ sơ CCCD & lưu trú khách thuê (SWR2.3 / UC06 / TC_USER_03)
exports.updateTenantProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: `Định danh người dùng '${req.params.id}' không hợp lệ!`
      });
    }
    const updatedTenant = await userService.updateTenantProfile(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ CCCD khách thuê thành công!',
      data: updatedTenant
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 10. [PUT /api/users/:id/status] Khóa / Mở khóa tài khoản (SWR2.4 / TC_USER_04)
exports.toggleUserStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: `Định danh người dùng '${req.params.id}' không hợp lệ!`
      });
    }
    const { isActive } = req.body;
    const result = await userService.toggleUserStatus(req.params.id, isActive);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 11. [PUT /api/users/:id] Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: `Định danh người dùng '${req.params.id}' không hợp lệ!`
      });
    }
    const updated = await userService.updateUser(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công!',
      data: updated
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 12. [DELETE /api/users/:id] Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: `Định danh người dùng '${req.params.id}' không hợp lệ!`
      });
    }
    const result = await userService.deleteUser(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 13. [GET /api/users/profile] Lấy thông tin cá nhân của người dùng
exports.getProfile = async (req, res) => {
  try {
    const userId = req.query?.userId || req.headers['x-user-id'] || req.user?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp định danh người dùng hợp lệ!'
      });
    }
    const profile = await userService.getProfile(userId);
    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin cá nhân thành công!',
      data: profile
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// 14. [PUT /api/users/profile] Cập nhật thông tin cá nhân của người dùng
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.body?.userId || req.query?.userId || req.headers['x-user-id'] || req.user?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp định danh người dùng hợp lệ!'
      });
    }
    const updated = await userService.updateProfile(userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      data: updated
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
