const mongoose = require('mongoose');
const roomService = require('../services/roomService');
const Room = require('../models/Room');
const Contract = require('../models/Contract');

const MONGO_URI = 'mongodb://127.0.0.1:27017/motel_management';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU CHẠY BỘ KIỂM THỬ - THÀNH VIÊN 1: QUANG');
  console.log('   Phân hệ: Room Management & Room Search');
  console.log('====================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!\n');

    // Dọn dẹp dữ liệu test cũ nếu có
    await Room.deleteMany({ roomNumber: { $in: ['TEST-101', 'TEST-102', 'TEST-103'] } });
    await Contract.deleteMany({ tenantName: 'Test Tenant Quang' });

    let createdTestRoomId = null;

    // ----------------------------------------------------
    // TEST CASE 01: TC_ROOM_01 - Tạo phòng với thông tin hợp lệ
    // ----------------------------------------------------
    console.log('🧪 [TC_ROOM_01] Kiểm thử tạo phòng với thông tin hợp lệ...');
    try {
      const roomData = {
        roomNumber: 'TEST-101',
        basePrice: 2500000,
        area: 25,
        maxOccupants: 2,
        amenities: ['Wifi', 'Điều hòa', 'Nóng lạnh', 'Gác lửng'],
        status: 'AVAILABLE',
        description: 'Phòng test tầng 1 sạch đẹp'
      };
      const room = await roomService.createRoom(roomData);
      createdTestRoomId = room._id;
      if (room && room.roomNumber === 'TEST-101' && room.basePrice === 2500000) {
        console.log('   👉 KẾT QUẢ: PASS ✅ (Đã tạo phòng TEST-101 thành công, ID:', room._id, ')\n');
      } else {
        throw new Error('Dữ liệu phòng tạo không khớp mong đợi!');
      }
    } catch (err) {
      console.error('   👉 KẾT QUẢ: FAIL ❌ -', err.message, '\n');
    }

    // ----------------------------------------------------
    // TEST CASE 02: TC_ROOM_02 - Tạo phòng trùng số phòng đã có
    // ----------------------------------------------------
    console.log('🧪 [TC_ROOM_02] Kiểm thử tạo phòng trùng số phòng đã có (TEST-101)...');
    try {
      await roomService.createRoom({
        roomNumber: 'TEST-101',
        basePrice: 3000000,
        area: 20
      });
      console.error('   👉 KẾT QUẢ: FAIL ❌ (Hệ thống không chặn phòng trùng!)\n');
    } catch (err) {
      console.log('   👉 KẾT QUẢ: PASS ✅ (Hệ thống đã chặn đúng với thông báo lỗi: "' + err.message + '")\n');
    }

    // ----------------------------------------------------
    // TEST CASE 03: TC_ROOM_03 - Tìm kiếm và lọc phòng trống AVAILABLE
    // ----------------------------------------------------
    console.log('🧪 [TC_ROOM_03] Kiểm thử tìm kiếm phòng trống AVAILABLE và theo khoảng giá...');
    try {
      const searchResults = await roomService.searchRooms({
        status: 'AVAILABLE',
        minPrice: 2000000,
        maxPrice: 3000000
      });
      const found = searchResults.some(r => r.roomNumber === 'TEST-101');
      if (found) {
        console.log(`   👉 KẾT QUẢ: PASS ✅ (Tìm thấy ${searchResults.length} phòng AVAILABLE phù hợp tiêu chí)\n`);
      } else {
        throw new Error('Không tìm thấy phòng TEST-101 trong kết quả lọc!');
      }
    } catch (err) {
      console.error('   👉 KẾT QUẢ: FAIL ❌ -', err.message, '\n');
    }

    // ----------------------------------------------------
    // TEST CASE 04: TC_ROOM_04 - Cập nhật giá phòng
    // ----------------------------------------------------
    console.log('🧪 [TC_ROOM_04] Kiểm thử cập nhật giá phòng TEST-101 thành 2.800.000 VNĐ...');
    try {
      const updated = await roomService.updateRoom(createdTestRoomId, {
        basePrice: 2800000,
        description: 'Phòng đã được nâng cấp nội thất mới'
      });
      if (updated.basePrice === 2800000) {
        console.log('   👉 KẾT QUẢ: PASS ✅ (Giá phòng được cập nhật thành công: ' + updated.basePrice.toLocaleString('vi-VN') + ' đ)\n');
      } else {
        throw new Error('Giá phòng sau cập nhật không đúng!');
      }
    } catch (err) {
      console.error('   👉 KẾT QUẢ: FAIL ❌ -', err.message, '\n');
    }

    // ----------------------------------------------------
    // TEST CASE 05: TC_ROOM_05 - Xóa phòng (Xóa phòng trống vs Chặn xóa phòng RENTED)
    // ----------------------------------------------------
    console.log('🧪 [TC_ROOM_05] Kiểm thử xóa phòng:');
    // 5a. Chặn xóa phòng RENTED
    console.log('   5a. Thử xóa phòng đang RENTED...');
    try {
      const rentedRoom = await roomService.createRoom({
        roomNumber: 'TEST-102',
        basePrice: 2000000,
        status: 'RENTED'
      });
      try {
        await roomService.deleteRoom(rentedRoom._id);
        console.error('   👉 KẾT QUẢ 5a: FAIL ❌ (Hệ thống cho phép xóa phòng RENTED!)\n');
      } catch (err) {
        console.log('   👉 KẾT QUẢ 5a: PASS ✅ (Chặn thành công phòng RENTED: "' + err.message + '")');
      }
      // Dọn dẹp phòng test
      await Room.findByIdAndDelete(rentedRoom._id);
    } catch (e) {
      console.error('   👉 Lỗi tạo phòng test 5a:', e.message);
    }

    // 5b. Xóa phòng trống AVAILABLE
    console.log('   5b. Xóa phòng trống TEST-101 (AVAILABLE)...');
    try {
      await roomService.deleteRoom(createdTestRoomId);
      const checkDeleted = await Room.findById(createdTestRoomId);
      if (!checkDeleted) {
        console.log('   👉 KẾT QUẢ 5b: PASS ✅ (Đã xóa phòng trống thành công khỏi CSDL!)\n');
      } else {
        throw new Error('Phòng vẫn còn tồn tại sau khi xóa!');
      }
    } catch (err) {
      console.error('   👉 KẾT QUẢ 5b: FAIL ❌ -', err.message, '\n');
    }

    console.log('====================================================');
    console.log('🎉 TẤT CẢ TEST CASES CỦA QUANG ĐÃ ĐƯỢC THỰC THI HOÀN TẤT!');
    console.log('====================================================');

  } catch (error) {
    console.error('❌ Lỗi kiểm thử:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
