const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');
const contractRoutes = require('./routes/contractRoutes');
const rentalRequestRoutes = require('./routes/rentalRequestRoutes');
const utilityRoutes = require('./routes/utilityRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Chuỗi kết nối MongoDB (Mặc định local, bạn có thể thay bằng MongoDB Atlas nếu muốn)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/motel_management';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ [MongoDB] Kết nối cơ sở dữ liệu thành công!'))
  .catch((err) => console.error('❌ [MongoDB] Lỗi kết nối CSDL:', err.message));

// Đăng ký Router
app.use('/api', roomRoutes);
app.use('/api', contractRoutes);
app.use('/api', rentalRequestRoutes);
app.use('/api', utilityRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', paymentRoutes);

// Route mặc định kiểm tra server
app.get('/', (req, res) => {
  res.send('API Motel Management System đang hoạt động!');
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📌 Test API Rooms tại: http://localhost:${PORT}/api/rooms`);
  console.log(`📌 Test API Contracts tại: http://localhost:${PORT}/api/contracts`);
  console.log(`📌 Test API Rental Requests tại: http://localhost:${PORT}/api/rental-requests`);
  console.log(`📌 Test API Utilities tại: http://localhost:${PORT}/api/utilities`);
  console.log(`📌 Test API Invoices tại: http://localhost:${PORT}/api/invoices`);
  console.log(`📌 Test API VNPay Sandbox tại: http://localhost:${PORT}/api/payment/create-payment-url`);
});
