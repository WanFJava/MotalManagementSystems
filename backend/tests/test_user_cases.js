const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const userService = require('../services/userService');

const DEFAULT_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/motel_management';

async function connectDatabase() {
  try {
    // Thử kết nối MongoDB cục bộ / cấu hình
    await mongoose.connect(DEFAULT_URI, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ Đã kết nối cơ sở dữ liệu MongoDB (${DEFAULT_URI}).`);
    return null;
  } catch (err) {
    console.log(`⚠️ Không thể kết nối MongoDB cục bộ (${err.message}).`);
    console.log('🔄 Đang kích hoạt MongoMemoryServer độc lập để chạy bộ test...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅ Kết nối MongoMemoryServer in-memory thành công tại: ${uri}`);
    return mongod;
  }
}

async function runUserTests() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ PHÂN HỆ QUẢN LÝ TÀI KHOẢN & KHÁCH THUÊ');
  console.log('   Thành viên 2: Khánh (User & Tenant Management)');
  console.log('   Test Cases: TC_USER_01 -> TC_USER_04');
  console.log('================================================================\n');

  let memoryServer = null;

  try {
    memoryServer = await connectDatabase();

    // Làm sạch dữ liệu test cũ nếu có
    await User.deleteMany({
      phone: { $in: ['0999000111', '0999000222', '0999000333', '0999000444'] }
    });

    let passCount = 0;
    const totalCount = 4;

    // -------------------------------------------------------------
    // TEST CASE 1: TC_USER_01 - Đăng ký tài khoản mới hợp lệ & Mã hóa Bcrypt
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('📌 [TC_USER_01] Đăng ký tài khoản mới hợp lệ & kiểm tra mã hóa mật khẩu');
    try {
      const regData = {
        fullName: 'Nguyễn Văn Test',
        phone: '0999000111',
        email: 'testuser01@gmail.com',
        password: 'Password123@',
        role: 'TENANT'
      };

      const result = await userService.registerUser(regData);

      // Kiểm tra trong MongoDB xem mật khẩu có thực sự được hash không
      const savedUser = await User.findById(result.user._id);
      const isPlainPassword = savedUser.password === 'Password123@';
      const isBcryptHashed = savedUser.password.startsWith('$2a$') || savedUser.password.startsWith('$2b$');

      if (!isPlainPassword && isBcryptHashed && result.token) {
        console.log('  ✅ Kết quả: Đăng ký thành công!');
        console.log(`     - User ID: ${savedUser._id}`);
        console.log(`     - Mật khẩu lưu trong DB (Bcrypt Hash): ${savedUser.password.substring(0, 25)}...`);
        console.log(`     - JWT Token sinh ra: ${result.token.substring(0, 30)}...`);
        console.log('  👉 [TC_USER_01] -> PASS ✅\n');
        passCount++;
      } else {
        throw new Error('Mật khẩu chưa được mã hóa an toàn hoặc không tạo được Token!');
      }
    } catch (err) {
      console.error('  ❌ [TC_USER_01] FAILED:', err.message);
    }

    // -------------------------------------------------------------
    // TEST CASE 2: TC_USER_02 - Đăng nhập sai mật khẩu và Đăng nhập thành công
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('📌 [TC_USER_02] Kiểm thử Đăng nhập (Sai mật khẩu vs Đúng mật khẩu)');
    try {
      let failedAsExpected = false;
      // Thử đăng nhập sai mật khẩu
      try {
        await userService.loginUser({
          identifier: '0999000111',
          password: 'SaiMatKhau123'
        });
      } catch (loginErr) {
        if (loginErr.message === 'Sai tài khoản hoặc mật khẩu!') {
          failedAsExpected = true;
          console.log('  ✅ 1. Nhập sai mật khẩu: Báo lỗi chính xác -> "Sai tài khoản hoặc mật khẩu!"');
        }
      }

      // Thử đăng nhập đúng mật khẩu
      const successLogin = await userService.loginUser({
        identifier: '0999000111',
        password: 'Password123@'
      });

      if (failedAsExpected && successLogin.token && successLogin.user.phone === '0999000111') {
        console.log('  ✅ 2. Nhập đúng mật khẩu: Đăng nhập thành công, sinh JWT Token hợp lệ.');
        console.log(`     - Token: ${successLogin.token.substring(0, 35)}...`);
        console.log('  👉 [TC_USER_02] -> PASS ✅\n');
        passCount++;
      } else {
        throw new Error('Lỗi kiểm tra logic đăng nhập!');
      }
    } catch (err) {
      console.error('  ❌ [TC_USER_02] FAILED:', err.message);
    }

    // -------------------------------------------------------------
    // TEST CASE 3: TC_USER_03 - Cập nhật hồ sơ CCCD khách thuê (UC06)
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('📌 [TC_USER_03] Cập nhật hồ sơ CCCD khách thuê & Chống trùng lặp');
    try {
      const user = await User.findOne({ phone: '0999000111' });

      const profileUpdate = {
        identityNumber: '001202999888',
        identityIssuedDate: '2022-06-15',
        identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
        hometown: 'Bắc Ninh',
        currentAddress: 'Số 99 Đường Xuân Thủy, Cầu Giấy, Hà Nội',
        temporaryResidenceStatus: 'REGISTERED'
      };

      const updated = await userService.updateTenantProfile(user._id, profileUpdate);

      // Thử tạo user thứ 2 và gán trùng số CCCD trên
      const user2 = await userService.registerUser({
        fullName: 'Trần Văn Trùng CCCD',
        phone: '0999000222',
        email: 'user02@gmail.com',
        password: 'Password123@'
      });

      let duplicateCaught = false;
      try {
        await userService.updateTenantProfile(user2.user._id, {
          identityNumber: '001202999888' // Trùng với user 1
        });
      } catch (dupErr) {
        if (dupErr.message.includes('đã tồn tại trong hồ sơ của khách thuê khác')) {
          duplicateCaught = true;
          console.log(`  ✅ Hệ thống chặn trùng CCCD chính xác: "${dupErr.message}"`);
        }
      }

      if (updated.identityNumber === '001202999888' && duplicateCaught) {
        console.log('  ✅ Cập nhật hồ sơ định danh CCCD và tình trạng tạm trú thành công.');
        console.log(`     - CCCD: ${updated.identityNumber} | Quê quán: ${updated.hometown} | Tạm trú: ${updated.temporaryResidenceStatus}`);
        console.log('  👉 [TC_USER_03] -> PASS ✅\n');
        passCount++;
      } else {
        throw new Error('Cập nhật CCCD thất bại hoặc không chặn được trùng lặp CCCD!');
      }
    } catch (err) {
      console.error('  ❌ [TC_USER_03] FAILED:', err.message);
    }

    // -------------------------------------------------------------
    // TEST CASE 4: TC_USER_04 - Khóa tài khoản nhân viên / khách thuê
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('📌 [TC_USER_04] Khóa tài khoản nhân viên / khách thuê (isActive = false)');
    try {
      // 1. Tạo một tài khoản nhân viên
      const staffUser = await userService.createStaff({
        fullName: 'Nhân Viên Bị Khóa Test',
        phone: '0999000333',
        email: 'staff_lock@motel.com',
        password: 'Password123@',
        role: 'STAFF'
      });

      // 2. Quản lý thực hiện khóa tài khoản (isActive = false)
      const lockResult = await userService.toggleUserStatus(staffUser._id, false);
      console.log(`  ✅ Đã thực hiện thao tác: ${lockResult.message} (isActive: false)`);

      // 3. Thử đăng nhập bằng tài khoản vừa bị khóa
      let blockLoginSuccess = false;
      try {
        await userService.loginUser({
          identifier: '0999000333',
          password: 'Password123@'
        });
      } catch (lockErr) {
        if (lockErr.message.includes('Tài khoản của bạn đã bị khóa')) {
          blockLoginSuccess = true;
          console.log(`  ✅ Hệ thống chặn đăng nhập chuẩn xác: "${lockErr.message}"`);
        }
      }

      // 4. Mở khóa lại tài khoản (isActive = true)
      await userService.toggleUserStatus(staffUser._id, true);
      const unlockLogin = await userService.loginUser({
        identifier: '0999000333',
        password: 'Password123@'
      });

      if (blockLoginSuccess && unlockLogin.token) {
        console.log('  ✅ Mở khóa tài khoản thành công, nhân viên đăng nhập lại bình thường!');
        console.log('  👉 [TC_USER_04] -> PASS ✅\n');
        passCount++;
      } else {
        throw new Error('Chưa chặn được tài khoản bị khóa hoặc không mở khóa được!');
      }
    } catch (err) {
      console.error('  ❌ [TC_USER_04] FAILED:', err.message);
    }

    // Dọn dẹp dữ liệu test
    await User.deleteMany({
      phone: { $in: ['0999000111', '0999000222', '0999000333', '0999000444'] }
    });

    console.log('================================================================');
    console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passCount}/${totalCount} TEST CASES PASS (${Math.round((passCount/totalCount)*100)}%)`);
    console.log('================================================================');

    if (memoryServer) {
      await mongoose.disconnect();
      await memoryServer.stop();
    } else {
      await mongoose.disconnect();
    }

    process.exit(passCount === totalCount ? 0 : 1);
  } catch (globalErr) {
    console.error('❌ Lỗi nghiêm trọng khi chạy kiểm thử:', globalErr);
    if (memoryServer) {
      await memoryServer.stop();
    }
    process.exit(1);
  }
}

runUserTests();
