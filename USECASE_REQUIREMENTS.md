# TÀI LIỆU YÊU CẦU PHẦN MỀM & ĐẶC TẢ USE CASE
## DỰ ÁN: MOTEL MANAGEMENT SYSTEM (HỆ THỐNG QUẢN LÝ NHÀ TRỌ)
**Môn học:** Software Design (SWD392) - FPT University  

---

## 1. TỔNG QUAN HỆ THỐNG
**Motel Management System** là giải pháp phần mềm toàn diện hỗ trợ quản lý vận hành khu nhà trọ/căn hộ dịch vụ. Hệ thống kết nối giữa Khách thuê trọ, Nhân viên quản lý và Chủ trọ, tự động hóa quy trình ghi nhận điện nước, tính toán hóa đơn, thanh toán trực tuyến qua cổng VNPay và giải quyết các khiếu nại, sự cố bảo trì.

---

## 2. DANH SÁCH TÁC NHÂN (ACTORS)

| Tác nhân | Phân loại | Mô tả vai trò |
| :--- | :--- | :--- |
| **Tenant (Khách thuê)** | Primary Actor | Người thuê phòng trọ; thực hiện tìm phòng, gửi yêu cầu thuê, theo dõi hóa đơn, thanh toán tiền phòng, báo hỏng và gửi phản ánh. |
| **Staff (Nhân viên)** | Primary Actor | Nhân viên quản lý trực tiếp tại khu trọ; thực hiện quản lý phòng, lập hợp đồng, cập nhật thông tin khách thuê, ghi số điện nước hàng tháng, thu tiền mặt và cập nhật tiến độ bảo trì. |
| **Manager (Chủ trọ / Quản lý)** | Primary Actor | Chủ khu trọ/Người quản trị cấp cao; **kế thừa toàn bộ quyền của Staff**, có thêm quyền cấu hình giá dịch vụ, quản lý nhân viên và xem báo cáo tài chính/doanh thu. |
| **Payment Gateway (VNPay)** | Secondary / External Actor | Cổng thanh toán trực tuyến bên ngoài; tiếp nhận giao dịch, sinh mã QR/cổng thẻ ATM và phản hồi kết quả thanh toán cho hệ thống. |

---

## 3. DANH MỤC CÁC USE CASE THEO PHÂN HỆ NGHIỆP VỤ

### Phân hệ 1: Xác thực & Tài khoản (Authentication & Profile)
- **UC01: Register / Login (Đăng ký / Đăng nhập)**
  - *Actor:* Tenant, Staff, Manager
  - *Mô tả:* Người dùng đăng ký tài khoản hoặc đăng nhập vào hệ thống bằng SĐT/Email và mật khẩu. Hệ thống trả về JWT Token và phân quyền tương ứng.

### Phân hệ 2: Quản lý Phòng & Đặt phòng (Room & Rental Management)
- **UC02: Search Room (Tìm kiếm phòng)**
  - *Actor:* Tenant
  - *Mô tả:* Khách xem danh sách phòng trống (`AVAILABLE`), lọc theo mức giá, diện tích, tiện ích đi kèm.
- **UC03: Request Rental (Gửi yêu cầu thuê phòng)**
  - *Actor:* Tenant
  - *Mô tả:* Khách chọn phòng ưng ý và gửi yêu cầu giữ phòng kèm ngày dự kiến chuyển vào để Staff/Manager liên hệ.
- **UC04: Manage Room (Quản lý phòng trọ)**
  - *Actor:* Staff, Manager
  - *Mô tả:* Thêm mới phòng, sửa thông tin phòng, cập nhật đơn giá cơ bản và chuyển trạng thái phòng (`AVAILABLE`, `RENTED`, `MAINTENANCE`).

### Phân hệ 3: Hợp đồng & Khách thuê (Contract & Tenant Management)
- **UC05: Manage Contract (Quản lý hợp đồng)**
  - *Actor:* Staff, Manager
  - *Mô tả:* Lập hợp đồng mới khi khách vào ở (ghi nhận số tiền cọc `depositAmount`, giá thuê, ngày bắt đầu - kết thúc); gia hạn hoặc thanh lý hợp đồng khi khách trả phòng.
- **UC06: Manage Tenant Info (Quản lý thông tin khách thuê)**
  - *Actor:* Staff, Manager
  - *Mô tả:* Cập nhật thông tin định danh của người thuê và các thành viên ở cùng (CCCD, quê quán, SĐT) phục vụ đăng ký tạm trú.

### Phân hệ 4: Điện nước & Thanh toán hóa đơn (Utility & Billing)
- **UC07: Record Utility Readings (Ghi chỉ số điện nước)**
  - *Actor:* Staff, Manager
  - *Mô tả:* Nhân viên đi ghi chỉ số điện, nước công tơ từng phòng vào cuối chu kỳ chốt sổ. Hệ thống tự động tính lượng tiêu thụ (`Chỉ số mới - Chỉ số cũ`).
- **UC08: Generate Monthly Invoice (Lập hóa đơn hàng tháng)**
  - *Actor:* Staff, Manager (hoặc tự động bởi Scheduler)
  - *Mô tả:* Hệ thống tính toán: `Tổng tiền = Tiền phòng + (Số điện * Giá điện) + (Số nước * Giá nước) + Dịch vụ khác` và tạo hóa đơn tháng.
- **UC09: Pay Invoice (Thanh toán hóa đơn trực tuyến)**
  - *Actor:* Tenant, Payment Gateway (VNPay)
  - *Quan hệ:* `<<include>>` UC08 (Generate Monthly Invoice)
  - *Mô tả:* Khách chọn hóa đơn cần trả, chọn thanh toán online qua VNPay; hệ thống chuyển hướng sang VNPay và nhận kết quả thanh toán tự động gạch nợ.
- **UC10: Confirm Cash Payment (Xác nhận thu tiền mặt)**
  - *Actor:* Staff, Manager
  - *Mô tả:* Với khách thanh toán tiền mặt trực tiếp, nhân viên xác nhận trên hệ thống để chuyển hóa đơn sang trạng thái `PAID`.

### Phân hệ 5: Bảo trì & Phản ánh (Maintenance & Feedback)
- **UC11: Submit Maintenance Request (Báo hỏng / Yêu cầu sửa chữa)**
  - *Actor:* Tenant
  - *Mô tả:* Khách gửi báo cáo sự cố cơ sở vật chất (hỏng đèn, vòi nước, điều hòa) kèm mã phòng và mô tả chi tiết.
- **UC12: Update Maintenance Status (Cập nhật tiến độ bảo trì)**
  - *Actor:* Staff, Manager
  - *Mô tả:* Tiếp nhận phiếu, phân công thợ xử lý và cập nhật tiến độ (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`).
- **UC13: Submit Feedback / Complaint (Gửi khiếu nại / Góp ý)**
  - *Actor:* Tenant
  - *Mô tả:* Khách gửi phản hồi về vệ sinh, an ninh hoặc thái độ phục vụ của khu trọ.

### Phân hệ 6: Quản trị hệ thống (System Administration)
- **UC14: Configure Pricing & Services (Cấu hình đơn giá dịch vụ)**
  - *Actor:* Manager
  - *Mô tả:* Thiết lập đơn giá điện (VNĐ/kWh), nước (VNĐ/m³), mạng internet, rác, phí gửi xe.
- **UC15: Manage Staff (Quản lý nhân viên)**
  - *Actor:* Manager
  - *Mô tả:* Tạo tài khoản nhân viên, phân quyền hoặc khóa tài khoản nhân viên nghỉ việc.
- **UC16: View Statistical Reports (Xem báo cáo thống kê)**
  - *Actor:* Manager
  - *Mô tả:* Xem báo cáo doanh thu theo tháng/năm, tỷ lệ lấp đầy phòng trống và danh sách các phòng còn nợ tiền trọ.

---

## 4. BẢNG ĐẶC TẢ CHI TIẾT USE CASE MẪU (USE CASE SPECIFICATION)

### Đặc tả UC09: Pay Invoice (Thanh toán hóa đơn)
- **Use Case Name:** Pay Invoice
- **Primary Actor:** Tenant
- **Secondary Actor:** Payment Gateway (VNPay)
- **Pre-condition:** Khách thuê đã đăng nhập và có ít nhất 1 hóa đơn ở trạng thái `UNPAID`.
- **Post-condition:** Hóa đơn được chuyển sang trạng thái `PAID`, giao dịch thanh toán được ghi nhận.
- **Main Flow (Luồng chính):**
  1. Khách thuê truy cập màn hình "Hóa đơn của tôi".
  2. Hệ thống hiển thị danh sách các hóa đơn chưa thanh toán.
  3. Khách thuê chọn 1 hóa đơn và nhấn nút "Thanh toán qua VNPay".
  4. Hệ thống tạo URL thanh toán và chuyển hướng ứng dụng sang cổng VNPay.
  5. Khách thuê quét mã VNPAY-QR hoặc nhập thông tin thẻ ATM và xác thực OTP.
  6. VNPay xử lý giao dịch thành công và gửi thông báo Webhook IPN về hệ thống.
  7. Hệ thống cập nhật trạng thái hóa đơn thành `PAID` và lưu thông tin giao dịch `PaymentTransaction`.
  8. Hệ thống hiển thị thông báo "Thanh toán thành công" cho Khách thuê.
- **Alternative Flow (Luồng phụ):**
  - *5a. Khách hủy giao dịch hoặc số dư không đủ:* VNPay phản hồi giao dịch thất bại; hệ thống giữ nguyên trạng thái hóa đơn `UNPAID` và thông báo lỗi cho khách.
