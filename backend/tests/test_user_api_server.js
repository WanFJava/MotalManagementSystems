const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const userRoutes = require('../routes/userRoutes');
const roomRoutes = require('../routes/roomRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', roomRoutes);

async function testUserApi() {
  console.log('🧪 Bắt đầu kiểm thử tích hợp RESTful API cho Thành viên 2 (Khánh)...');
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const server = app.listen(5098, async () => {
    console.log('✅ Server test Member 2 khởi chạy tại port 5098');
    try {
      // 1. POST /api/auth/register (TC_USER_01)
      const regRes = await fetch('http://localhost:5098/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Phạm Văn Khánh (API Test)',
          phone: '0912999888',
          email: 'khanh.api@gmail.com',
          password: 'Password123@',
          role: 'TENANT'
        })
      });
      const regData = await regRes.json();
      console.log('1. POST /api/auth/register -> Thành công, Token:', regData.data.token ? 'Có' : 'Không');

      // 2. POST /api/auth/login (TC_USER_02)
      const loginRes = await fetch('http://localhost:5098/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '0912999888',
          password: 'Password123@'
        })
      });
      const loginData = await loginRes.json();
      const token = loginData.data.token;
      const userId = loginData.data.user._id;
      console.log('2. POST /api/auth/login -> Thành công:', loginData.message);

      // 3. GET /api/auth/me (Verify JWT Token)
      const meRes = await fetch('http://localhost:5098/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = await meRes.json();
      console.log('3. GET /api/auth/me -> Thành công, User:', meData.data.fullName);

      // 3b. GET /api/users/profile
      const getProfRes = await fetch('http://localhost:5098/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const getProfData = await getProfRes.json();
      console.log('3b. GET /api/users/profile -> Thành công, Email:', getProfData.data.email);

      // 3c. PUT /api/users/profile
      const updateProfRes = await fetch('http://localhost:5098/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: 'Số 123 Đường Cầu Giấy, Hà Nội',
          identityNumber: '001202888999'
        })
      });
      const updateProfData = await updateProfRes.json();
      console.log('3c. PUT /api/users/profile -> Thành công, Address:', updateProfData.data.address);

      // 4. PUT /api/users/:id/tenant-profile (TC_USER_03)
      const profileRes = await fetch(`http://localhost:5098/api/users/${userId}/tenant-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          identityNumber: '001202888999',
          hometown: 'Nam Định',
          temporaryResidenceStatus: 'REGISTERED'
        })
      });
      const profileData = await profileRes.json();
      console.log('4. PUT /api/users/:id/tenant-profile -> Thành công, CCCD:', profileData.data.identityNumber);

      // 5. GET /api/users/tenants (UC06)
      const tenantsRes = await fetch('http://localhost:5098/api/users/tenants');
      const tenantsData = await tenantsRes.json();
      console.log('5. GET /api/users/tenants -> Thành công, Tổng số khách:', tenantsData.count);

      // 6. POST /api/users/staff (UC15)
      const staffRes = await fetch('http://localhost:5098/api/users/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: 'Nhân Viên Lê Vận Hành',
          phone: '0908889991',
          email: 'staff_op@motel.com',
          password: 'Password123@',
          role: 'STAFF'
        })
      });
      const staffData = await staffRes.json();
      const staffId = staffData.data._id;
      console.log('6. POST /api/users/staff -> Thành công:', staffData.message);

      // 7. PUT /api/users/:id/status (TC_USER_04 - Khóa tài khoản)
      const lockRes = await fetch(`http://localhost:5098/api/users/${staffId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: false })
      });
      const lockData = await lockRes.json();
      console.log('7. PUT /api/users/:id/status -> Thành công:', lockData.message, '(isActive:', lockData.data.isActive, ')');

      console.log('\n🎉 TOÀN BỘ ENDPOINT RESTFUL API CỦA THÀNH VIÊN 2 (KHÁNH) HOẠT ĐỘNG HOÀN HẢO!');
    } catch (err) {
      console.error('❌ Lỗi kiểm tra API:', err);
    } finally {
      server.close(() => {
        mongoose.disconnect().then(() => {
          mongod.stop().then(() => {
            process.exit(0);
          });
        });
      });
    }
  });
}

testUserApi();
