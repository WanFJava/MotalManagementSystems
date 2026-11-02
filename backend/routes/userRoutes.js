const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

/**
 * Danh sách Endpoint RESTful API phân hệ Quản lý Tài khoản & Khách thuê
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 */

// --- 1. Nhóm Xác thực tài khoản (Authentication) ---
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.get('/auth/me', verifyToken, userController.getMe);

// --- 2. Nhóm Quản lý Khách thuê (Tenant Profile - UC06) ---
router.get('/users/tenants', userController.getTenants);
router.put('/users/:id/tenant-profile', userController.updateTenantProfile);

// --- 3. Nhóm Quản lý Nhân viên (Staff Management - UC15) ---
router.get('/users/staff', userController.getStaff);
router.post('/users/staff', userController.createStaff);
router.put('/users/:id/status', userController.toggleUserStatus);

// --- 4. Nhóm Quản trị Người dùng tổng quát ---
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
