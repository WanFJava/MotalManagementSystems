const mongoose = require('mongoose');
const Room = require('../models/Room');

const MONGO_URI = 'mongodb://127.0.0.1:27017/motel_management';

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

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB để nạp dữ liệu mẫu...');

    for (const data of sampleRooms) {
      await Room.findOneAndUpdate(
        { roomNumber: data.roomNumber },
        { $set: data },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Đã nạp thành công ${sampleRooms.length} phòng trọ mẫu!`);
  } catch (err) {
    console.error('❌ Lỗi nạp dữ liệu:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
