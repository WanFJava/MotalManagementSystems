# QUY ƯỚC KỸ THUẬT & NGUYÊN TẮC LÀM VIỆC CHUNG (TEAM WORKING AGREEMENT)
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Môn học:** Software Design (SWD392) - FPT University  
**Phạm vi áp dụng:** Cả 4 thành viên trong nhóm (Thành viên 1, 2, 3, 4)

---

## 1. NGUYÊN TẮC KIẾN TRÚC DỰ ÁN (PROJECT ARCHITECTURE)

* **Một mã nguồn duy nhất (Single Repository):** Toàn đội làm việc trên cùng một repository chung, tuyệt đối **không** tạo repo backend hoặc frontend riêng lẻ.
* **Cấu trúc thư mục thống nhất:**
  ```text
  MotalManagementSystems/
  ├── backend/               # 1 Express Server duy nhất (Port 5000)
  │   ├── models/            # Chứa các Entity Schema Mongoose (Room, User, Contract, Invoice,...)
  │   ├── services/          # Chứa Business Logic (roomService, contractService,...)
  │   ├── controllers/       # Tiếp nhận Request, gọi Service và trả Response
  │   ├── routes/            # Khai báo các Endpoint RESTful API
  │   ├── seeds/             # Script nạp dữ liệu mẫu dùng chung
  │   └── server.js
  │
  ├── frontend/              # 1 Ứng dụng Client duy nhất (Port 5173)
  │   ├── src/
  │   │   ├── screens/       # Các màn hình phân hệ của từng thành viên
  │   │   ├── components/    # Component dùng chung (Navbar, Header, Toast, Modal)
  │   │   ├── services/      # Các Client Service gọi Axios API tập trung
  │   │   └── App.jsx        # Điểm kết nối điều hướng toàn ứng dụng
  ```
* **Phân tầng trách nhiệm:** Client (Frontend) chỉ giao tiếp với Backend thông qua RESTful API bằng JSON, không kết nối trực tiếp vào CSDL MongoDB.

---

## 2. QUY CHUẨN PHẢN HỒI API (API RESPONSE CONTRACT)

Mọi API Backend do bất kỳ thành viên nào viết **bắt buộc phải trả về JSON theo đúng một định dạng chuẩn duy nhất**:

### Cấu trúc phản hồi chuẩn:
```json
{
  "success": true,               // Boolean: true khi thành công, false khi thất bại
  "message": "Thông báo ngắn gọn", // Chuỗi thông báo để Frontend hiển thị thông báo
  "data": { ... }                // Object hoặc Array kết quả (gán null nếu có lỗi)
}
```

### Quy tắc kiểu dữ liệu trong API & CSDL:
* **Tiền tệ:** Luôn là kiểu `Number` (VD: `2500000`, tuyệt đối không lưu chuỗi `"2.500.000 đ"` trong DB).
* **Ngày tháng:** Luôn dùng định dạng ISO 8601 (`YYYY-MM-DD` hoặc `new Date().toISOString()`).
* **HTTP Status Code chuẩn:**
  * `200 OK`: Truy vấn, cập nhật, xóa thành công.
  * `201 Created`: Tạo mới bản ghi thành công.
  * `400 Bad Request`: Lỗi dữ liệu đầu vào (thiếu trường bắt buộc, trùng mã, logic sai).
  * `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ.
  * `403 Forbidden`: Không đủ quyền truy cập (vd: Tenant truy cập trang Quản lý).
  * `404 Not Found`: Không tìm thấy bản ghi theo ID.
  * `500 Internal Server Error`: Lỗi phát sinh từ phía server.

---

## 3. QUY CHUẨN TÊN CSDL, SCHEMA VÀ CÁC ENUMS CHUNG

### Danh mục Collection trong MongoDB:
| Collection | Thực thể quản lý | Khóa ngoại tham chiếu (ObjectId) | Quy định trường dữ liệu chính |
| :--- | :--- | :--- | :--- |
| **`rooms`** | Phòng trọ | *(Không có)* | `roomNumber` (unique), `basePrice`, `area`, `status` |
| **`users`** | Tài khoản & Khách thuê | *(Không có)* | `phone` (unique), `email`, `role`, `identityNumber` (CCCD) |
| **`contracts`** | Hợp đồng thuê phòng | `room` (Ref: `Room`), `tenant` (Ref: `User`) | `startDate`, `endDate`, `depositAmount`, `rentalPrice`, `status` |
| **`utilities`** | Ghi chỉ số điện nước | `room` (Ref: `Room`) | `month`, `oldElec`, `newElec`, `oldWater`, `newWater` |
| **`invoices`** | Hóa đơn & Thanh toán | `contract` (Ref: `Contract`), `room` (Ref: `Room`), `tenant` (Ref: `User`) | `totalAmount`, `status`, `dueDate`, `paymentMethod` |

### Bộ giá trị Enums thống nhất (Bắt buộc viết HOA):
* **Trạng thái Phòng (`Room.status`):**
  * `'AVAILABLE'`: Phòng còn trống, sẵn sàng cho thuê.
  * `'RENTED'`: Phòng đã có người thuê.
  * `'MAINTENANCE'`: Phòng đang sửa chữa/bảo trì.
* **Trạng thái Hợp đồng (`Contract.status`):**
  * `'DRAFT'`: Hợp đồng nháp.
  * `'ACTIVE'`: Hợp đồng đang có hiệu lực.
  * `'EXPIRED'`: Hợp đồng hết hạn.
  * `'TERMINATED'`: Hợp đồng đã thanh lý.
* **Trạng thái Hóa đơn (`Invoice.status`):**
  * `'UNPAID'`: Hóa đơn chưa thanh toán.
  * `'PAID'`: Đã thanh toán.
  * `'OVERDUE'`: Quá hạn thanh toán.
* **Vai trò người dùng (`User.role`):**
  * `'TENANT'`: Khách thuê phòng.
  * `'STAFF'`: Nhân viên quản lý khu trọ.
  * `'MANAGER'`: Chủ nhà trọ / Quản trị viên cấp cao.

---

## 4. QUY TẮC RÀNG BUỘC NGHIỆP VỤ CHÉO GIỮA CÁC THÀNH VIÊN

Các thành viên phụ trách các phân hệ khác nhau nhưng dữ liệu phải đồng bộ chặt chẽ:

1. **Ràng buộc giữa Phân hệ Phòng và Hợp đồng:**
   * **Khi lập hợp đồng mới (`ACTIVE`):** Hệ thống chỉ cho phép chọn phòng đang ở trạng thái `'AVAILABLE'`. Ngay khi hợp đồng được kích hoạt, trạng thái phòng **tự động chuyển thành `'RENTED'`**.
   * **Khi thanh lý hợp đồng (`TERMINATED`):** Phòng liên quan **tự động được trả về trạng thái `'AVAILABLE'`**.
   * **Khi xóa hoặc sửa phòng:** Không được phép xóa hoặc đổi trạng thái phòng sang `'AVAILABLE'` nếu phòng đó đang có hợp đồng `'ACTIVE'`.

2. **Ràng buộc giữa Phân hệ Hợp đồng và Điện nước / Hóa đơn:**
   * Khi tạo hóa đơn hàng tháng, hệ thống chỉ tạo hóa đơn cho những phòng **đang có hợp đồng `'ACTIVE'`**.
   * Tiền phòng trong hóa đơn phải lấy đúng từ thỏa thuận giá thuê (`rentalPrice`) trong Hợp đồng.
   * Khi ghi điện nước: Chỉ số mới **bắt buộc phải lớn hơn hoặc bằng** chỉ số cũ.

3. **Ràng buộc giữa Phân hệ Tài khoản và Khách thuê:**
   * Chỉ những tài khoản có vai trò `'TENANT'` mới được chọn làm đại diện đứng tên trên Hợp đồng thuê.

---

## 5. QUY TRÌNH QUẢN LÝ MÃ NGUỒN GIT (GIT WORKFLOW)

1. **Nguyên tắc nhánh (Branching Policy):**
   * Nhánh `main`: Chỉ chứa mã nguồn đã kiểm thử và chạy ổn định. **Tuyệt đối không push code trực tiếp lên `main`**.
   * Mỗi thành viên tạo và làm việc trên nhánh tính năng riêng:
     * Phân hệ Phòng: `feature/room` hoặc `quang`
     * Phân hệ Tài khoản: `feature/auth-tenant` hoặc `khanh`
     * Phân hệ Hợp đồng: `feature/contract` hoặc `duc`
     * Phân hệ Hóa đơn: `feature/invoice` hoặc `manh`
2. **Quy trình cập nhật code hằng ngày:**
   * Trước khi bắt đầu viết code: Luôn chạy `git checkout main && git pull` sau đó `git merge main` vào nhánh của mình để tránh xung đột mã nguồn (conflict).
   * Khi hoàn thành một tính năng: Tạo **Pull Request (PR)** trên GitHub để nhóm cùng review trước khi merge vào `main`.
3. **Quy định file `.gitignore`:**
   * Tuyệt đối không commit thư mục `node_modules`, các file build (`dist/`, `build/`) và các file biến môi trường bí mật (`.env`).

---

## 6. MÔI TRƯỜNG CHẠY & DỮ LIỆU KIỂM THỬ CHUNG (DEV & TEST DATA)

* **Cấu hình cổng cục bộ:**
  * Backend Server: `http://localhost:5000`
  * Frontend Vite: `http://localhost:5173`
* **Chuỗi kết nối MongoDB mặc định:** `mongodb://127.0.0.1:27017/motel_management`
* **Dữ liệu mẫu chung (Seed Data):**
  * Tất cả thành viên sử dụng chung script khởi tạo dữ liệu mẫu (`npm run seed` trong thư mục `backend`) để đảm bảo mọi máy đều có sẵn danh sách phòng mẫu (101, 102, 201...) phục vụ việc test hợp đồng và hóa đơn ngay lập tức.

---

## 7. TIÊU CHÍ HOÀN THÀNH TÍNH NĂNG (DEFINITION OF DONE - DoD)

Một tính năng được coi là hoàn thành khi đáp ứng đủ 4 tiêu chí:
1. **Database:** Entity Schema có đầy đủ validation theo quy ước.
2. **Backend API:** Viết đủ Service, Controller, Route và đã test bằng Postman/Test script trả về đúng chuẩn JSON chung.
3. **Frontend:** Giao diện gọi API động qua Axios (không hard-code dữ liệu giả), có xử lý trạng thái Loading và thông báo Toast lỗi/thành công rõ ràng.
4. **Kiểm thử:** Đạt 100% các ca kiểm thử (Test Cases) được giao trong tài liệu đặc tả dự án.
