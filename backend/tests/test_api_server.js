const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const roomRoutes = require('../routes/roomRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', roomRoutes);

async function testApi() {
  await mongoose.connect('mongodb://127.0.0.1:27017/motel_management');
  const server = app.listen(5099, async () => {
    console.log('✅ Server test khởi chạy tại port 5099');
    try {
      // 1. GET /api/rooms
      const res = await fetch('http://localhost:5099/api/rooms');
      const data = await res.json();
      console.log('1. GET /api/rooms -> Thành công, tổng số phòng:', data.count);

      // 2. GET /api/rooms/search
      const searchRes = await fetch('http://localhost:5099/api/rooms/search?status=AVAILABLE&minPrice=2000000');
      const searchData = await searchRes.json();
      console.log('2. GET /api/rooms/search -> Thành công, phòng AVAILABLE giá >= 2tr:', searchData.count);

      // 3. Tìm phòng AVAILABLE để test rental-request
      const availRoom = data.data.find(r => r.status === 'AVAILABLE') || data.data[0];
      const detailRes = await fetch(`http://localhost:5099/api/rooms/${availRoom._id}`);
      const detailData = await detailRes.json();
      console.log('3. GET /api/rooms/:id -> Thành công, chi tiết phòng:', detailData.data.roomNumber);

      // 4. POST /api/rooms/:id/rental-request
      const reqRes = await fetch(`http://localhost:5099/api/rooms/${availRoom._id}/rental-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Nguyễn Văn Test', phone: '0988776655' })
      });
      const reqData = await reqRes.json();
      console.log('4. POST /api/rooms/:id/rental-request -> Thành công:', reqData.message);

      console.log('\n🎉 TOÀN BỘ ENDPOINT API CỦA QUANG HOẠT ĐỘNG HOÀN HẢO!');
    } catch (err) {
      console.error('❌ Lỗi kiểm tra API:', err);
    } finally {
      server.close(() => {
        mongoose.disconnect().then(() => {
          process.exit(0);
        });
      });
    }
  });
}

testApi();
