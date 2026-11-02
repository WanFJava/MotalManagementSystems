const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/motel_management';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ [MongoDB] Đang nạp dữ liệu mẫu Người dùng & Khách thuê (Thành viên 2 - Khánh)...');

    // Tìm một số phòng mẫu có sẵn để gán vào hồ sơ khách thuê
    const room101 = await Room.findOne({ roomNumber: '101' });
    const room102 = await Room.findOne({ roomNumber: '102' });
    const room201 = await Room.findOne({ roomNumber: '201' });

    // Xóa các user mẫu cũ
    const seedPhones = [
      '0901234567',
      '0902345678',
      '0903456789',
      '0912345678',
      '0912345679',
      '0912345680'
    ];
    await User.deleteMany({ phone: { $in: seedPhones } });

    const sampleUsers = [
      // 1. Quản lý / Chủ trọ (MANAGER)
      {
        fullName: 'Nguyễn Quản Lý (Chủ Trọ)',
        phone: '0901234567',
        email: 'manager@motel.com',
        password: 'Password123@',
        role: 'MANAGER',
        isActive: true,
        identityNumber: '001090001122',
        hometown: 'Hà Nội',
        currentAddress: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
        temporaryResidenceStatus: 'REGISTERED'
      },
      // 2. Nhân viên quản lý (STAFF)
      {
        fullName: 'Lê Văn An (Nhân viên Quản lý)',
        phone: '0902345678',
        email: 'staff1@motel.com',
        password: 'Password123@',
        role: 'STAFF',
        isActive: true,
        identityNumber: '001091002233',
        hometown: 'Hải Phòng',
        currentAddress: 'Tòa nhà FPT, Cầu Giấy, Hà Nội',
        temporaryResidenceStatus: 'REGISTERED'
      },
      // 3. Nhân viên thu ngân (STAFF)
      {
        fullName: 'Trần Thị Bích (Nhân viên Thu ngân)',
        phone: '0903456789',
        email: 'staff2@motel.com',
        password: 'Password123@',
        role: 'STAFF',
        isActive: true,
        identityNumber: '001092003344',
        hometown: 'Bắc Ninh',
        currentAddress: 'Cổ Nhuế, Bắc Từ Liêm, Hà Nội',
        temporaryResidenceStatus: 'REGISTERED'
      },
      // 4. Khách thuê 1: Phạm Văn Khánh (TENANT)
      {
        fullName: 'Phạm Văn Khánh',
        phone: '0912345678',
        email: 'khanh.tenant@gmail.com',
        password: 'Password123@',
        role: 'TENANT',
        isActive: true,
        identityNumber: '001202008899',
        identityIssuedDate: new Date('2021-05-15'),
        identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
        dateOfBirth: new Date('2002-08-20'),
        gender: 'MALE',
        hometown: 'Nam Định',
        currentAddress: 'Phòng 101, Tòa nhà Trọ Xanh, Cầu Giấy, Hà Nội',
        currentRoom: room101 ? room101._id : null,
        temporaryResidenceStatus: 'REGISTERED',
        identityCardFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
        identityCardBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
      },
      // 5. Khách thuê 2: Trần Minh Hoàng (TENANT)
      {
        fullName: 'Trần Minh Hoàng',
        phone: '0912345679',
        email: 'hoang.tenant@gmail.com',
        password: 'Password123@',
        role: 'TENANT',
        isActive: true,
        identityNumber: '034201004567',
        identityIssuedDate: new Date('2022-01-10'),
        identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
        dateOfBirth: new Date('2001-11-12'),
        gender: 'MALE',
        hometown: 'Thái Bình',
        currentAddress: 'Phòng 102, Cầu Giấy, Hà Nội',
        currentRoom: room102 ? room102._id : null,
        temporaryResidenceStatus: 'PENDING',
        identityCardFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
      },
      // 6. Khách thuê 3: Nguyễn Thị Lan (TENANT)
      {
        fullName: 'Nguyễn Thị Lan',
        phone: '0912345680',
        email: 'lan.tenant@gmail.com',
        password: 'Password123@',
        role: 'TENANT',
        isActive: true,
        identityNumber: '037303001234',
        identityIssuedDate: new Date('2023-04-18'),
        identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
        dateOfBirth: new Date('2003-03-25'),
        gender: 'FEMALE',
        hometown: 'Ninh Bình',
        currentAddress: 'Phòng 201, Cầu Giấy, Hà Nội',
        currentRoom: room201 ? room201._id : null,
        temporaryResidenceStatus: 'REGISTERED'
      }
    ];

    for (const u of sampleUsers) {
      const created = new User(u);
      await created.save();
    }

    console.log(`🎉 [Thành công] Đã nạp ${sampleUsers.length} tài khoản mẫu thành công!`);
    console.log('📌 Danh sách tài khoản mẫu để đăng nhập kiểm thử:');
    console.log('   - Quản lý (MANAGER):   manager@motel.com / SĐT: 0901234567 | Mật khẩu: Password123@');
    console.log('   - Nhân viên (STAFF):    staff1@motel.com  / SĐT: 0902345678 | Mật khẩu: Password123@');
    console.log('   - Khách thuê (TENANT):  khanh.tenant@gmail.com / SĐT: 0912345678 | Mật khẩu: Password123@');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi nạp dữ liệu mẫu:', error.message);
    process.exit(1);
  }
};

seedUsers();
