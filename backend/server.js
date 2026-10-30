const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');
const contractRoutes = require('./routes/contractRoutes');
const userRoutes = require('./routes/userRoutes');
const { seedAll } = require('./seeds/seed_helper');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Chuỗi kết nối MongoDB (Mặc định local, tự động fallback in-memory nếu chưa mở MongoDB daemon)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/motel_management';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ [MongoDB] Kết nối cơ sở dữ liệu cục bộ thành công!');
    await seedAll();
  } catch (err) {
    console.log(`⚠️ Không thể kết nối MongoDB cục bộ (${err.message}).`);
    console.log('🔄 Đang tự động kích hoạt MongoMemoryServer độc lập...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log(`✅ [MongoMemoryServer] Đã khởi tạo CSDL in-memory thành công!`);
    await seedAll();
  }

  // Đăng ký Router
  app.use('/api', roomRoutes);
  app.use('/api', contractRoutes);
  app.use('/api', userRoutes);

  // Route mặc định kiểm tra server
  app.get('/', (req, res) => {
    res.send('API Motel Management System đang hoạt động!');
  });

  // Khởi chạy server
  app.listen(PORT, () => {
    console.log(`🚀 Backend Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📌 Test API Rooms tại: http://localhost:${PORT}/api/rooms`);
    console.log(`📌 Test API Users & Auth tại: http://localhost:${PORT}/api/users`);
  });
}

startServer();
