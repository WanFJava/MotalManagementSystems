# BÁO CÁO CHI TIẾT XÂY DỰNG NHIỆM VỤ - THÀNH VIÊN 1: NGUYỄN NGỌC QUANG (LEADER)
**Học phần:** Software Design (SWD392) - FPT University  
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Phân hệ đảm nhiệm:** Quản lý Phòng & Yêu cầu Thuê / Tìm kiếm Phòng *(Room & Rental Management)*  
**Đối tượng quản lý cốt lõi:** `Room` (MongoDB Collection: `rooms`)

---

## 1. TỔNG QUAN PHÂN HỆ CỦA THÀNH VIÊN 1 (QUANG)

| Tiêu chí | Nội dung chi tiết |
| :--- | :--- |
| **Họ tên thành viên** | **Nguyễn Ngọc Quang (Leader)** |
| **Phân hệ nghiệp vụ** | **Room Management & Room Search** (Quản lý Phòng & Tìm kiếm phòng) |
| **Chức năng CRUD cốt lõi** | **CRUD Room (Phòng trọ)** |
| **Use Cases phụ trách** | • **UC02: Search Room** (Tìm kiếm & Lọc phòng đa tiêu chí)<br>• **UC04: Manage Room** (Quản trị danh mục phòng)<br>• **UC03 (Phối hợp): Request Rental** (Xem chi tiết phòng & Gửi yêu cầu thuê phòng) |
| **Công nghệ sử dụng** | Node.js + Express + MongoDB (Mongoose ODM) + ReactJS (Vite) + Axios |
| **Kiến trúc áp dụng** | **MVC (Model - View/Boundary - Controller) kết hợp Service Layer** |

---

## 2. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE MODEL)
- **Collection:** `rooms`
- **Tập tin:** `backend/models/Room.js`

### Bảng thuộc tính Schema `Room`:
| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `roomNumber` | `String` | `required, unique, trim` | Số hiệu phòng trọ (VD: "101", "202") |
| `basePrice` | `Number` | `required, min: 1` | Giá thuê cơ bản hàng tháng (VNĐ/tháng) |
| `area` | `Number` | `required, min: 5, default: 20` | Diện tích phòng trọ ($m^2$) |
| `maxOccupants` | `Number` | `min: 1, default: 2` | Số lượng người ở tối đa được phép |
| `amenities` | `[String]` | Mảng chuỗi | Danh sách tiện ích (Wifi, Điều hòa, Nóng lạnh, Gác lửng,...) |
| `status` | `String` | Enum: `['AVAILABLE', 'RENTED', 'MAINTENANCE']` | Tình trạng: Còn trống, Đã thuê, Đang bảo trì |
| `description` | `String` | Text | Mô tả chi tiết không gian, nội thất, quy định phòng |
| `images` | `[String]` | Mảng URL | Danh sách hình ảnh thực tế của phòng trọ |
| `createdAt`, `updatedAt` | `Date` | Tự động sinh | Dấu thời gian tạo và cập nhật bản ghi |

---

## 3. DANH SÁCH RESTFUL API (BACKEND)
Được đăng ký tại `backend/routes/roomRoutes.js`, xử lý qua `backend/controllers/roomController.js` và `backend/services/roomService.js`:

| Phương thức | Đường dẫn API | Chức năng nghiệp vụ | Use Case liên quan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Lấy danh sách toàn bộ phòng trọ, sắp xếp mới nhất | SWR1.2 |
| `GET` | `/api/rooms/search` | Tìm kiếm & lọc phòng theo: `keyword`, `status`, `minPrice`, `maxPrice`, `minArea`, `maxArea`, `amenity` | **UC02: Search Room** |
| `GET` | `/api/rooms/:id` | Lấy thông tin chi tiết một phòng trọ | SWR1.4 |
| `POST` | `/api/rooms` | Thêm mới một phòng trọ (Validate số phòng không trùng, giá > 0) | **UC04 / TC_ROOM_01, TC_ROOM_02** |
| `PUT` | `/api/rooms/:id` | Cập nhật thông tin phòng (Validate không đổi sang AVAILABLE nếu có hợp đồng ACTIVE) | **UC04 / TC_ROOM_04** |
| `DELETE` | `/api/rooms/:id` | Xóa phòng (Chặn xóa phòng `RENTED` hoặc có hợp đồng `ACTIVE`) | **UC04 / TC_ROOM_05** |
| `POST` | `/api/rooms/:id/rental-request` | Tiếp nhận yêu cầu thuê/giữ phòng từ khách thuê | **UC03: Request Rental** |

---

## 4. CÁC MÀN HÌNH GIAO DIỆN FRONTEND (REACTJS)
Theo đặc tả phân công công việc của Quang, toàn bộ 5 màn hình thành phần đã được hoàn thiện tại `frontend/src/screens/`:

1. **`HomeScreen.jsx` (Trang chủ tổng quan):**
   - Hero banner giới thiệu dự án và phân hệ Room Management.
   - 4 Thẻ KPI thống kê phòng trọ: Tổng số phòng, Phòng trống (`AVAILABLE`), Đã cho thuê (`RENTED`), Đang bảo trì (`MAINTENANCE`).
   - Danh sách "Phòng trống nổi bật" sẵn sàng cho thuê với các nút chuyển nhanh.

2. **`RoomListScreen.jsx` (Danh sách phòng trọ):**
   - Hỗ trợ 2 chế độ hiển thị linh hoạt: **Card Grid View** (dạng lưới trực quan kèm ảnh) và **Table View** (dạng bảng quản trị).
   - Thanh lọc nhanh theo trạng thái (`Tất cả`, `🟢 Còn trống`, `🔴 Đã thuê`, `🛠️ Đang sửa`).
   - Ô tìm kiếm nhanh theo số phòng hoặc mô tả.

3. **`RoomSearchScreen.jsx` (Màn hình Tìm kiếm & Lọc phòng - UC02):**
   - Form lọc đa tiêu chí: Từ khóa, Tình trạng phòng, Khoảng giá (Giá tối thiểu - Giá tối đa), Khoảng diện tích ($m^2$), Tiện ích mong muốn.
   - Kết nối trực tiếp API `GET /api/rooms/search`.
   - Hiển thị danh sách kết quả tìm kiếm tức thì.

4. **`RoomDetailScreen.jsx` (Chi tiết phòng & Gửi yêu cầu thuê - UC02 & UC03):**
   - Gallery ảnh phòng trọ chất lượng cao.
   - Chi tiết thông số: Số phòng, giá thuê niêm yết, diện tích, sức chứa, mô tả và toàn bộ tiện ích có sẵn.
   - Form tương tác **"Gửi yêu cầu giữ phòng" (UC03)**: Nhập Họ tên, Số điện thoại, Email, Ngày dự kiến dọn vào, Ghi chú. Khi gửi, hệ thống gọi API và hiển thị mã yêu cầu xác nhận.

5. **`ManageRoomScreen.jsx` (Quản trị danh mục phòng - UC04):**
   - Dành cho Chủ trọ / Nhân viên quản lý.
   - Form CRUD Thêm phòng mới / Chỉnh sửa thông tin phòng: Số phòng, Giá cơ bản, Diện tích, Sức chứa, Trạng thái, Checklist tiện ích, Link ảnh và Mô tả.
   - Bảng quản trị danh sách với các nút thao tác nhanh `✏️ Sửa` và `🗑️ Xóa`.
   - Có cơ chế chặn xóa thông minh khi phòng đang có khách thuê (`RENTED`).

6. **`Navbar.jsx` & `App.jsx`:**
   - Header điều hướng mượt mà giữa các màn hình.
   - Hệ thống Toast Notification thông báo kết quả (Thành công, Thất bại, Cảnh báo).

---

## 5. KẾT QUẢ KIỂM THỬ TEST CASES (SWT - 100% PASS)
Chạy bằng lệnh: `npm run test:room` (tại thư mục `backend`):

| Test Case ID | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_ROOM_01** | Tạo phòng với thông tin hợp lệ | `roomNumber: "TEST-101"`, `basePrice: 2500000`, `area: 25`, `maxOccupants: 2` | Tạo thành công (Status 201), dữ liệu được lưu vào MongoDB. | Tạo thành công phòng `TEST-101`, trả về mã ObjectId. | **PASS ✅** |
| **TC_ROOM_02** | Tạo phòng trùng số phòng đã có | `roomNumber: "TEST-101"` (đã tồn tại) | Báo lỗi Status 400: "Số phòng đã tồn tại". | Báo lỗi: "Số phòng 'TEST-101' đã tồn tại trên hệ thống! Vui lòng chọn số khác." | **PASS ✅** |
| **TC_ROOM_03** | Tìm kiếm phòng trống AVAILABLE | `status = 'AVAILABLE'`, `minPrice = 2000000`, `maxPrice = 3000000` | Trả về danh sách chỉ gồm các phòng còn trống trong khoảng giá. | Tìm thấy danh sách phòng AVAILABLE phù hợp tiêu chí. | **PASS ✅** |
| **TC_ROOM_04** | Cập nhật giá phòng | Đổi `basePrice` thành `2800000` | Cập nhật thành công Status 200. | Cập nhật giá phòng thành 2.800.000 VNĐ thành công. | **PASS ✅** |
| **TC_ROOM_05** | Xóa phòng (Xóa phòng trống vs Chặn xóa phòng RENTED) | • Xóa phòng `RENTED`<br>• Xóa phòng `AVAILABLE` | • Phòng RENTED: Chặn xóa, báo lỗi.<br>• Phòng AVAILABLE: Xóa thành công khỏi CSDL. | • Báo lỗi: "Không thể xóa phòng đang có khách thuê (RENTED)! Vui lòng thanh lý hợp đồng trước."<br>• Đã xóa phòng trống thành công. | **PASS ✅** |

---

## 6. HƯỚNG DẪN KHỞI CHẠY VÀ DEMO DỰ ÁN

### Bước 1: Khởi động MongoDB
Đảm bảo dịch vụ MongoDB đang chạy tại cổng mặc định `127.0.0.1:27017`.

### Bước 2: Nạp dữ liệu mẫu và chạy kiểm thử Backend
Mở Terminal tại thư mục `backend`:
```powershell
cd D:\LuyenReactJS\MotalManagementSystems\backend

# 1. Nạp dữ liệu mẫu 6 phòng trọ thực tế:
npm run seed

# 2. Chạy bộ kiểm thử tự động 5 test cases của Quang:
npm run test:room

# 3. Khởi động server backend (Port 5000):
npm start
```

### Bước 3: Khởi động giao diện Frontend
Mở Terminal mới tại thư mục `frontend`:
```powershell
cd D:\LuyenReactJS\MotalManagementSystems\frontend

# Khởi chạy Vite Dev Server:
npm run dev
```
Truy cập trình duyệt tại địa chỉ: `http://localhost:5173` để trải nghiệm toàn bộ các màn hình của Quang.
