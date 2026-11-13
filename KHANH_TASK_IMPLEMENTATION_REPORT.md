# BÁO CÁO CHI TIẾT XÂY DỰNG NHIỆM VỤ - THÀNH VIÊN 2: PHẠM VĂN KHÁNH
**Học phần:** Software Design (SWD392) - FPT University  
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Phân hệ đảm nhiệm:** Quản lý Tài khoản & Khách thuê *(User & Tenant Management)*  
**Đối tượng quản lý cốt lõi:** `User` (MongoDB Collection: `users`)

---

## 1. TỔNG QUAN PHÂN HỆ CỦA THÀNH VIÊN 2 (KHÁNH)

| Tiêu chí | Nội dung chi tiết |
| :--- | :--- |
| **Họ tên thành viên** | **Phạm Văn Khánh (Thành viên 2)** |
| **Phân hệ nghiệp vụ** | **User & Tenant Management** (Quản lý Tài khoản, Khách thuê & Nhân viên) |
| **Chức năng CRUD cốt lõi** | **CRUD User / Tenant Profile** |
| **Use Cases phụ trách** | • **UC01: Register / Login** (Đăng ký, Đăng nhập với JWT, mã hóa Bcrypt)<br>• **UC06: Manage Tenant Information** (Quản lý hồ sơ CCCD, quê quán, đăng ký tạm trú, phân bổ phòng)<br>• **UC15: Manage Staff** (Quản trị nhân viên, phân quyền, khóa/mở khóa tài khoản) |
| **Công nghệ sử dụng** | Node.js + Express + MongoDB (Mongoose ODM) + JWT + Bcrypt + ReactJS (Vite) + Axios |
| **Kiến trúc áp dụng** | **MVC (Model - Boundary - Controller) kết hợp Service Layer** |

---

## 2. Ý NGHĨA NGHIỆP VỤ THỰC TẾ

Khách thuê bắt buộc phải có màn hình **`ProfileScreen`** để:

1. **Hoàn thiện hồ sơ định danh pháp lý:**
   - Cập nhật **Số CCCD (12 chữ số)**, ngày cấp, nơi cấp.
   - Cập nhật **Quê quán / Địa chỉ thường trú**.
   - Tải lên ảnh chụp 2 mặt của thẻ CCCD để chủ trọ khai báo tạm trú với Công an khu vực theo Luật Cư trú.
2. **Quản lý thông tin liên lạc & tài khoản:**
   - Cập nhật **Số điện thoại** hoặc **Email** để nhận thông báo tiền phòng, hóa đơn hàng tháng.
   - **Đổi mật khẩu** tài khoản khi cần bảo mật.
3. **Phục vụ tự động điền (Auto-fill):**
   - Khi khách đã cập nhật đầy đủ CCCD trong Profile, khi sang phân hệ của Quang để bấm *"Gửi yêu cầu thuê phòng"*, hệ thống sẽ tự động lấy thông tin từ Profile sang, khách không cần gõ lại từ đầu.

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE MODEL)
- **Collection:** `users`
- **Tập tin:** `backend/models/User.js`

### Bảng thuộc tính Schema `User`:
| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `fullName` | `String` | `required, trim` | Họ và tên người dùng (VD: "Phạm Văn Khánh") |
| `phone` | `String` | `required, unique, trim` | Số điện thoại đăng nhập (9-11 chữ số) |
| `email` | `String` | `required, unique, trim, lowercase` | Email đăng nhập & nhận thông báo |
| `password` | `String` | `required, minlength: 6` | Mật khẩu tài khoản (Mã hóa Bcrypt với salt 10 vòng) |
| `role` | `String` | Enum: `['TENANT', 'STAFF', 'MANAGER']` | Vai trò: Khách thuê, Nhân viên vận hành, Chủ trọ |
| `isActive` | `Boolean` | `default: true` | Trạng thái tài khoản (Cho phép Khóa/Mở khóa) |
| `identityNumber` | `String` | `unique, sparse, trim` | Số CCCD/Hộ chiếu (9 đến 12 chữ số) |
| `identityIssuedDate` | `Date` | Tùy chọn | Ngày cấp thẻ CCCD |
| `identityIssuedPlace`| `String` | Mặc định: "Cục Cảnh sát QLHC về TTXH" | Nơi cấp CCCD |
| `identityCardFront` | `String` | URL | Link ảnh mặt trước thẻ CCCD |
| `identityCardBack`  | `String` | URL | Link ảnh mặt sau thẻ CCCD |
| `dateOfBirth`       | `Date` | Tùy chọn | Ngày tháng năm sinh |
| `gender`            | `String` | Enum: `['MALE', 'FEMALE', 'OTHER']` | Giới tính khách thuê |
| `hometown`          | `String` | Trim | Quê quán (Tỉnh/Thành phố gốc) |
| `currentAddress`    | `String` | Trim | Địa chỉ thường trú / tạm trú |
| `currentRoom`       | `ObjectId` | Ref: `'Room'`, `default: null` | Phòng đang thuê hiện tại |
| `temporaryResidenceStatus` | `String` | Enum: `['NOT_REGISTERED', 'PENDING', 'REGISTERED']` | Trạng thái đăng ký tạm trú với Công an |
| `createdAt`, `updatedAt` | `Date` | Tự động sinh | Dấu thời gian tạo và cập nhật bản ghi |

---

## 4. DANH SÁCH RESTFUL API (BACKEND)
Được đăng ký tại `backend/routes/userRoutes.js`, xử lý qua `backend/controllers/userController.js` và `backend/services/userService.js`:

| Phương thức | Đường dẫn API | Chức năng nghiệp vụ | Use Case liên quan |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới (Validate trùng SĐT, Email, mã hóa Bcrypt) | **UC01 / TC_USER_01** |
| `POST` | `/api/auth/login` | Đăng nhập hệ thống (Sinh JWT Token, kiểm tra tài khoản bị khóa) | **UC01 / TC_USER_02** |
| `GET` | `/api/auth/me` | Lấy thông tin tài khoản đang đăng nhập từ Bearer Token | **SWR2.2** |
| `GET` | `/api/users/profile` | Lấy thông tin hồ sơ cá nhân của người dùng | **UC01 / UC06** |
| `PUT` | `/api/users/profile` | Cập nhật hồ sơ cá nhân (CCCD, địa chỉ, ảnh 2 mặt) | **UC06 / TC_USER_03** |
| `GET` | `/api/users/tenants` | Lấy danh sách khách thuê (Lọc theo từ khóa, phòng ở, tạm trú) | **UC06** |
| `PUT` | `/api/users/:id/tenant-profile` | Cập nhật hồ sơ định danh CCCD & tình trạng tạm trú (Chặn trùng CCCD) | **UC06 / TC_USER_03** |
| `GET` | `/api/users/staff` | Lấy danh sách nhân viên & quản lý | **UC15** |
| `POST` | `/api/users/staff` | Tạo mới tài khoản nhân viên vận hành | **UC15** |
| `PUT` | `/api/users/:id/status` | Khóa hoặc Mở khóa tài khoản người dùng (`isActive = true/false`) | **UC15 / TC_USER_04** |
| `GET` | `/api/users` | Lấy danh sách toàn bộ người dùng hệ thống | SWR2.4 |
| `GET` | `/api/users/:id` | Lấy chi tiết thông tin người dùng theo ID | SWR2.3 |
| `PUT` | `/api/users/:id` | Cập nhật thông tin tài khoản | SWR2.3 |
| `DELETE` | `/api/users/:id` | Xóa tài khoản người dùng | SWR2.4 |

---

## 5. CÁC MÀN HÌNH GIAO DIỆN FRONTEND (REACTJS)
Toàn bộ giao diện phân hệ của Khánh đã được triển khai hoàn chỉnh tại thư mục `frontend/src/screens/` và kết nối Client Service tại `frontend/src/services/userClientService.js`:

1. **`AuthScreen.jsx` (Đăng ký & Đăng nhập - UC01 / SWR2.1, SWR2.2):**
   - Hỗ trợ 2 chế độ mượt mà: Đăng nhập (`Login`) và Đăng ký (`Register`).
   - Có thanh **Demo Quick Login** tiện lợi hỗ trợ giảng viên/nhóm chấm bài click 1 chạm để đăng nhập vai trò:
     - 👑 **Quản lý (Manager):** SĐT `0901234567`
     - 🛡️ **Nhân viên (Staff):** SĐT `0902345678`
     - 🙋 **Khách thuê (Tenant):** SĐT `0912345678`
   - Hiển thị thông tin hồ sơ tài khoản và nút Đăng xuất an toàn khi đã đăng nhập.

2. **`ManageTenantScreen.jsx` (Quản lý Khách thuê & Hồ sơ CCCD - UC06 / SWR2.3):**
   - Bảng danh sách toàn bộ khách thuê kèm thông tin phòng đang cư trú, số điện thoại, quê quán, số CCCD và tình trạng tạm trú.
   - Thanh công cụ tìm kiếm tức thì theo: Tên, SĐT, Email, số CCCD; bộ lọc theo Phòng đang ở và Trạng thái tạm trú (`Đã đăng ký`, `Chờ duyệt`, `Chưa đăng ký`).
   - Modal cập nhật chi tiết hồ sơ:
     - Số CCCD 12 số (có kiểm tra chống trùng lặp theo quy chuẩn), Ngày cấp, Nơi cấp.
     - Ngày sinh, Giới tính, Quê quán, Địa chỉ thường trú.
     - Phân bổ / Chỉ định phòng đang ở (`currentRoom`).
     - Cập nhật trạng thái khai báo tạm trú và Link ảnh CCCD mặt trước/sau.

3. **`ManageStaffScreen.jsx` (Quản lý Đội ngũ Nhân viên - UC15 / SWR2.4):**
   - Bảng danh sách nhân viên & chủ trọ kèm nhãn phân quyền vai trò (`STAFF` / `MANAGER`).
   - Modal thêm mới tài khoản nhân viên vận hành: Họ tên, SĐT, Email, Mật khẩu ban đầu.
   - Nút **Khóa / Mở khóa tài khoản** (`TC_USER_04`) hoạt động tức thì, ngăn chặn nhân viên bị khóa đăng nhập vào hệ thống.
   - Cơ chế bảo vệ tài khoản: Không cho phép Quản lý tự khóa hoặc tự xóa tài khoản của chính mình.

4. **Tích hợp Điều hướng & Thông báo (`Navbar.jsx` & `App.jsx`):**
   - Bổ sung 2 tab điều hướng mới: `👥 Khách thuê` và `🛡️ Nhân viên`.
   - Header hiển thị người dùng đang đăng nhập cùng huy hiệu vai trò và nút Đăng xuất nhanh.
   - Đồng bộ Toast Notification thông báo trạng thái thành công/thất bại theo thời gian thực.

---

## 6. CÁC MÀN HÌNH MOBILE APP (REACT NATIVE)
Triển khai đầy đủ 5 màn hình React Native tại thư mục `mobile/screens/` và kết nối API tại `mobile/services/api.js`:

1. **`LoginScreen.jsx` (Đăng nhập - UC01 / TC_USER_02):**
   - Đăng nhập bằng Số điện thoại hoặc Email + Mật khẩu.
   - Nút điền nhanh tài khoản kiểm thử 1 chạm cho Chủ trọ, Nhân viên, Khách thuê.
   - Tự động lưu Token và điều hướng tương ứng với vai trò.
2. **`RegisterScreen.jsx` (Đăng ký tài khoản - UC01 / TC_USER_01):**
   - Form đăng ký: Họ tên, Số điện thoại, Email, Mật khẩu, Xác nhận mật khẩu, Lựa chọn vai trò (`TENANT` / `MANAGER`).
   - Kiểm tra định dạng Regex SĐT (9-11 số), Email, độ dài mật khẩu >= 6 ký tự.
3. **`ProfileScreen.jsx` (Xem & Cập nhật Hồ sơ cá nhân - UC01, UC06 / TC_USER_03):**
   - Chế độ xem: Thông tin tài khoản, CCCD, Nơi cấp, Quê quán, Địa chỉ thường trú, Tình trạng tạm trú, Phòng đang ở, hiển thị ảnh chụp 2 mặt CCCD.
   - Chế độ sửa: Cập nhật thông tin qua `PUT /api/users/profile`.
   - Nút Đăng xuất an toàn.
4. **`TenantManagementScreen.jsx` (Quản lý Khách thuê - UC06 / SWR2.3):**
   - Thanh tìm kiếm tức thì theo Tên, SĐT, CCCD; Lọc theo trạng thái tạm trú (`Đã ĐK`, `Chờ duyệt`, `Chưa ĐK`).
   - Danh sách khách thuê kèm huy hiệu phòng trọ, trạng thái tạm trú.
   - Modal cập nhật chi tiết CCCD, quê quán, địa chỉ và tình trạng tạm trú Công an.
5. **`StaffManagementScreen.jsx` (Quản lý Nhân viên - UC15 / SWR2.4 / TC_USER_04):**
   - Danh sách nhân viên & quản lý với nhãn phân quyền và trạng thái hoạt động.
   - Modal thêm nhân viên mới (`POST /api/users/staff`).
   - Nút Khóa / Mở khóa tài khoản nhân viên tức thì (`PUT /api/users/:id/status`).

---

## 7. TÀI LIỆU UML & ĐẶC TẢ HỆ THỐNG
Tài liệu sơ đồ kiến trúc hoàn chỉnh đã được tạo tại [`docs/UML_USER_TENANT.md`](file:///d:/LuyenReactJS/MotalManagementSystems/docs/UML_USER_TENANT.md):
- **Use Case Diagram (Mermaid):** Đặc tả các Use Case UC01, UC06, UC15 với các Actor Guest, Tenant, Staff, Manager.
- **Class Diagram (Mermaid):** Mô hình hóa cấu trúc lớp User, Enums, UserService, UserController, AuthMiddleware.
- **Sequence Diagram (Mermaid):** Luồng xử lý Đăng ký / Đăng nhập (UC01), Cập nhật CCCD & Tạm trú (UC06), Khóa tài khoản nhân viên (UC15).
- **Data Dictionary:** Bảng từ điển dữ liệu chi tiết cho collection `users`.

---

## 8. KẾT QUẢ KIỂM THỬ TEST CASES (SWT - 100% PASS)

Chạy kiểm thử tự động bằng lệnh:
```bash
npm run test:user
```

### Bảng kết quả kiểm thử thực tế:

| Test Case ID | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_USER_01** | Đăng ký tài khoản mới hợp lệ & Mã hóa Bcrypt | `phone: "0999000111"`, `password: "Password123@"`, `fullName: "Nguyễn Văn Test"`, `role: "TENANT"` | Đăng ký thành công (Status 201), mật khẩu trong DB được hash bằng Bcrypt (không lưu plain text), sinh JWT Token. | Mật khẩu lưu dưới dạng `$2b$10$...`, tạo thành công tài khoản và sinh Token JWT hợp lệ. | **PASS ✅** |
| **TC_USER_02** | Đăng nhập hệ thống (Sai mật khẩu vs Đúng mật khẩu) | • Nhập sai mật khẩu: `"SaiMatKhau123"`<br>• Nhập đúng mật khẩu: `"Password123@"` | • Sai: Báo lỗi "Sai tài khoản hoặc mật khẩu!" (Status 401).<br>• Đúng: Đăng nhập thành công, trả về JWT Token và thông tin user. | Hệ thống từ chối truy cập khi sai pass và cấp phát Token khi đúng thông tin. | **PASS ✅** |
| **TC_USER_03** | Cập nhật hồ sơ cá nhân, CCCD & Chống trùng lặp | • Nhập CCCD: `"001202999888"`, quê quán `"Bắc Ninh"`, địa chỉ `"Số 99 Đường Xuân Thủy, Cầu Giấy, Hà Nội"`<br>• Thử gán trùng CCCD trên cho khách thứ 2 | • Hồ sơ được cập nhật thành công qua `updateProfile`, trạng thái tạm trú đổi sang `REGISTERED`.<br>• Chặn trùng CCCD, báo lỗi rõ ràng. | Cập nhật hồ sơ thành công; hệ thống chặn trùng CCCD: "Số CCCD '001202999888' đã tồn tại trong hồ sơ của khách thuê khác!". | **PASS ✅** |
| **TC_USER_04** | Kiểm tra phân quyền User & Khóa tài khoản | • User role `TENANT` truy cập chức năng `MANAGER`<br>• Quản lý đổi `isActive = false`<br>• Nhân viên đăng nhập<br>• Quản lý mở lại `isActive = true` | • Phân quyền chặt chẽ (403 Forbidden).<br>• Khi bị khóa: Chặn đăng nhập.<br>• Khi mở lại: Đăng nhập bình thường. | Chặn 403 Forbidden chính xác; Báo lỗi tài khoản bị khóa chuẩn xác; sau khi mở khóa đăng nhập thành công. | **PASS ✅** |

---

## 9. HƯỚNG DẪN CHẠY VÀ NGHIỆM THU

### 1. Chạy Backend Server:
```bash
cd backend
npm run start
```
*Server lắng nghe tại `http://localhost:5000`*

### 2. Chạy bộ kiểm thử tự động (Unit & Integration Tests):
```bash
cd backend
npm run test:user         # Kiểm thử toàn bộ 4 Test Cases nghiệp vụ (100% Pass)
npm run test:user-api     # Kiểm thử toàn bộ các Endpoint HTTP RESTful API (100% Pass)
```

### 3. Nạp dữ liệu mẫu người dùng & khách thuê:
```bash
cd backend
npm run seed:user
```

### 4. Khởi chạy giao diện Frontend Web:
```bash
cd frontend
npm run dev
```
*Truy cập ứng dụng tại `http://localhost:5173`*

### 5. Khởi chạy giao diện Mobile (React Native / Expo):
```bash
cd mobile
npm start
```

