# Hướng Dẫn Chạy & Test API Motel Management System

## 1. Cài đặt thư viện
Mở Terminal tại thư mục `D:\LuyenReactJS\MotalManagementSystems\backend` và chạy:
```bash
npm install
```

## 2. Khởi chạy Server
```bash
npm start
```
Server sẽ chạy tại `http://localhost:5000`.

---

## 3. Các Endpoint API để Test (bằng Postman hoặc Thunder Client / cURL)

### 📌 [POST] Tạo phòng mới
- **URL:** `http://localhost:5000/api/rooms`
- **Method:** `POST`
- **Body (raw JSON):**
```json
{
  "roomNumber": "101",
  "basePrice": 2500000,
  "maxOccupants": 2,
  "status": "AVAILABLE"
}
```

### 📌 [GET] Lấy danh sách tất cả các phòng
- **URL:** `http://localhost:5000/api/rooms`
- **Method:** `GET`

### 📌 [GET] Lấy chi tiết 1 phòng theo ID
- **URL:** `http://localhost:5000/api/rooms/:id`
- **Method:** `GET`

### 📌 [PUT] Cập nhật thông tin phòng
- **URL:** `http://localhost:5000/api/rooms/:id`
- **Method:** `PUT`
- **Body (raw JSON):**
```json
{
  "basePrice": 2700000,
  "status": "RENTED"
}
```

### 📌 [DELETE] Xóa phòng
- **URL:** `http://localhost:5000/api/rooms/:id`
- **Method:** `DELETE`
