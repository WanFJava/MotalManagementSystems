const Room = require('../models/Room');
const User = require('../models/User');

const sampleRooms = [
  {
    roomNumber: '101',
    basePrice: 2500000,
    area: 22,
    maxOccupants: 2,
    status: 'AVAILABLE',
    amenities: ['Wifi', 'Điều hòa', 'Bình nóng lạnh', 'Gác lửng', 'Cửa sổ thoáng'],
    description: 'Phòng trọ tầng 1, có gác lửng cao ráo, thoáng mát, vệ sinh khép kín, giờ giấc tự do không chung chủ.',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    roomNumber: '102',
    basePrice: 2800000,
    area: 25,
    maxOccupants: 3,
    status: 'AVAILABLE',
    amenities: ['Wifi', 'Điều hòa', 'Bình nóng lạnh', 'Gác lửng', 'Tủ lạnh', 'Kệ bếp nấu ăn'],
    description: 'Phòng rộng rãi 25m², có sẵn tủ lạnh và kệ bếp nấu ăn riêng biệt, phù hợp nhóm 2-3 bạn sinh viên hoặc người đi làm.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    roomNumber: '201',
    basePrice: 3200000,
    area: 28,
    maxOccupants: 2,
    status: 'RENTED',
    amenities: ['Wifi', 'Điều hòa', 'Bình nóng lạnh', 'Ban công', 'Máy giặt chung', 'Tủ quần áo'],
    description: 'Phòng có ban công đón ánh sáng tự nhiên, view thoáng mát, trang bị đầy đủ giường nệm và tủ quần áo.',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    roomNumber: '202',
    basePrice: 2200000,
    area: 18,
    maxOccupants: 2,
    status: 'AVAILABLE',
    amenities: ['Wifi', 'Bình nóng lạnh', 'Quạt trần', 'Gác xép'],
    description: 'Phòng tiêu chuẩn giá sinh viên tiết kiệm, an ninh tốt, camera giám sát 24/7, chỗ để xe rộng rãi miễn phí.',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    roomNumber: '301',
    basePrice: 3500000,
    area: 32,
    maxOccupants: 3,
    status: 'AVAILABLE',
    amenities: ['Wifi', 'Điều hòa', 'Bình nóng lạnh', 'Tủ lạnh', 'Gác lửng', 'Ban công', 'Máy hút mùi'],
    description: 'Phòng Studio cao cấp có ban công riêng cực chill, full nội thất xịn, khóa vân tay an toàn tuyệt đối.',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    roomNumber: '302',
    basePrice: 2600000,
    area: 24,
    maxOccupants: 2,
    status: 'MAINTENANCE',
    amenities: ['Wifi', 'Điều hòa', 'Bình nóng lạnh'],
    description: 'Phòng đang được sơn sửa và nâng cấp điều hòa mới, dự kiến hoàn thành và sẵn sàng cho thuê trong 3 ngày tới.',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

async function seedAll() {
  console.log('🌱 Đang nạp dữ liệu mẫu ban đầu (Rooms & Users)...');
  
  // 1. Seed Rooms
  const createdRooms = [];
  for (const r of sampleRooms) {
    const existing = await Room.findOne({ roomNumber: r.roomNumber });
    if (!existing) {
      const room = await Room.create(r);
      createdRooms.push(room);
    } else {
      createdRooms.push(existing);
    }
  }

  // 2. Seed Users
  const room101 = createdRooms.find(r => r.roomNumber === '101');
  const room102 = createdRooms.find(r => r.roomNumber === '102');
  const room201 = createdRooms.find(r => r.roomNumber === '201');

  const sampleUsers = [
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
    {
      fullName: 'Phạm Văn Khánh (Khách thuê)',
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
      currentAddress: 'Phòng 101, Cầu Giấy, Hà Nội',
      currentRoom: room101 ? room101._id : null,
      temporaryResidenceStatus: 'REGISTERED',
      identityCardFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      identityCardBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
    },
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
      temporaryResidenceStatus: 'PENDING'
    },
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
    const existing = await User.findOne({ phone: u.phone });
    if (!existing) {
      await User.create(u);
    }
  }

  console.log(`✅ Đã nạp thành công ${sampleRooms.length} phòng và ${sampleUsers.length} tài khoản mẫu!`);
}

module.exports = { seedAll, sampleRooms };
