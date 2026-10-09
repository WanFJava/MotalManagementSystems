# TÀI LIỆU PHÂN CHIA CÔNG VIỆC & ĐẶC TẢ CHI TIẾT DỰ ÁN (CHO 4 THÀNH VIÊN)
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Môn học:** Software Design (SWD392) - FPT University  

---

## I. MA TRẬN PHÂN CHIA CÔNG VIỆC TỔNG QUAN (4 THÀNH VIÊN)

| Thành viên | Phân hệ nghiệp vụ đảm nhiệm | Chức năng CRUD cốt lõi | Use Cases phụ trách | Công nghệ & Đối tượng quản lý |
| :--- | :--- | :--- | :--- | :--- |
| **Thành viên 1 (Leader)** | **Quản lý Phòng & Yêu cầu Thuê** *(Room & Rental Management)* | **CRUD Room (Phòng trọ)** | • UC02: Search Room<br>• UC03: Request Rental<br>• UC04: Manage Room | React Native / React + Node.js + Express + MongoDB (`Room`) |
| **Thành viên 2** | **Quản lý Tài khoản & Khách thuê** *(User & Tenant Management)* | **CRUD Tenant / User** | • UC01: Register / Login<br>• UC06: Manage Tenant Info<br>• UC15: Manage Staff | JWT Auth + bcrypt + MongoDB (`User`, `TenantProfile`) |
| **Thành viên 3** | **Quản lý Hợp đồng & Đặt cọc** *(Contract & Deposit Management)* | **CRUD Contract (Hợp đồng)** | • UC05: Manage Contract<br>• UC05.1: Extend Contract<br>• UC05.2: Terminate Contract | Date Handling + Status Machine + MongoDB (`Contract`) |
| **Thành viên 4** | **Điện nước, Hóa đơn & Thanh toán** *(Utility, Billing & Payment)* | **CRUD Utility & Invoice** | • UC07: Record Utility Readings<br>• UC08: Generate Monthly Invoice<br>• UC09: Pay Invoice (VNPay) | Logic Service + VNPay Sandbox API + MongoDB (`UtilityReading`, `Invoice`) |

---

## II. ĐẶC TẢ CHI TIẾT TỪNG THÀNH VIÊN

---

### 👤 THÀNH VIÊN 1: QUẢN LÝ PHÒNG & YÊU CẦU THUÊ PHÒNG (ROOM CRUD)

#### 1. Yêu cầu phần mềm (SWR - Software Requirements)
- **SWR1.1:** Hệ thống cho phép Nhân viên/Chủ trọ thêm mới thông tin phòng trọ (Số phòng, Đơn giá cơ bản, Diện tích, Số người tối đa, Tiện ích đi kèm).
- **SWR1.2:** Hệ thống hỗ trợ tìm kiếm và lọc phòng trống theo các tiêu chí: Khoảng giá, tình trạng phòng (`AVAILABLE`, `RENTED`, `MAINTENANCE`).
- **SWR1.3:** Cho phép cập nhật thông tin phòng hoặc đổi trạng thái phòng khi khách dọn vào/dọn ra.
- **SWR1.4:** Khách thuê có thể xem chi tiết thông tin phòng và gửi yêu cầu giữ phòng/thuê phòng.

#### 2. Kế hoạch kiểm thử (SWT - Software Testing Test Cases)
| Test Case ID | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| **TC_ROOM_01** | Tạo phòng với thông tin hợp lệ | `roomNumber: "101"`, `basePrice: 2500000`, `maxOccupants: 2` | Tạo thành công (Status 201), dữ liệu được lưu vào MongoDB. |
| **TC_ROOM_02** | Tạo phòng trùng số phòng đã có | `roomNumber: "101"` (đã tồn tại) | Hệ thống báo lỗi (Status 400), "Số phòng đã tồn tại". |
| **TC_ROOM_03** | Tìm kiếm phòng trống | Lọc `status = AVAILABLE` | Trả về danh sách chỉ gồm các phòng còn trống. |
| **TC_ROOM_04** | Cập nhật giá phòng | Đổi `basePrice` thành `2700000` | Giá phòng được cập nhật thành công (Status 200). |
| **TC_ROOM_05** | Xóa phòng chưa có người ở | Chọn xóa phòng trạng thái `AVAILABLE` | Xóa thành công khỏi hệ thống. |

#### 3. Đặc tả Use Case chi tiết: **Manage Room (UC04)**
- **Actor:** Staff, Manager
- **Pre-condition:** Nhân viên đã đăng nhập và có quyền quản lý phòng.
- **Post-condition:** Dữ liệu phòng được tạo mới/cập nhật/xóa khỏi hệ thống.
- **Main Flow:**
  1. Nhân viên truy cập danh mục "Quản lý phòng trọ".
  2. Hệ thống tải danh sách toàn bộ phòng và bộ lọc tìm kiếm.
  3. Nhân viên chọn thao tác (Thêm mới, Chỉnh sửa, hoặc Xóa).
  4. Hệ thống kiểm tra tính hợp lệ của dữ liệu (Validate dữ liệu).
  5. Hệ thống lưu thay đổi vào CSDL MongoDB và hiển thị thông báo thành công.

---

### 👤 THÀNH VIÊN 2: QUẢN LÝ TÀI KHOẢN & KHÁCH THUÊ (TENANT CRUD)

#### 1. Yêu cầu phần mềm (SWR - Software Requirements)
- **SWR2.1:** Cho phép người dùng đăng ký tài khoản bằng Số điện thoại/Email và mật khẩu được mã hóa an toàn (`bcrypt`).
- **SWR2.2:** Cung cấp tính năng Đăng nhập trả về mã định danh bảo mật **JSON Web Token (JWT)** phân chia rõ các vai trò: `TENANT`, `STAFF`, `MANAGER`.
- **SWR2.3:** Hỗ trợ CRUD hồ sơ định danh khách thuê: Họ tên, Số CCCD/Hộ chiếu, Ngày sinh, Quê quán, Ảnh mặt trước/sau CCCD (phục vụ đăng ký tạm trú).
- **SWR2.4:** Cho phép Chủ trọ quản lý danh sách nhân viên (Thêm, cấp quyền, khóa tài khoản).

#### 2. Kế hoạch kiểm thử (SWT - Software Testing Test Cases)
| Test Case ID | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| **TC_USER_01** | Đăng ký tài khoản mới hợp lệ | `phoneNumber: "0912345678"`, `password: "Pass123@"` | Đăng ký thành công, mật khẩu trong DB được hash. |
| **TC_USER_02** | Đăng nhập sai mật khẩu | `phoneNumber: "0912345678"`, `password: "SaiPass"` | Báo lỗi "Sai tài khoản hoặc mật khẩu" (Status 401). |
| **TC_USER_03** | Cập nhật hồ sơ CCCD khách thuê | Nhập số CCCD: 12 chữ số hợp lệ | Hồ sơ được cập nhật, trạng thái tạm trú thành công. |
| **TC_USER_04** | Khóa tài khoản nhân viên | Manager chuyển trạng thái `isActive = false` | Tài khoản nhân viên không thể đăng nhập tiếp vào hệ thống. |

#### 3. Đặc tả Use Case chi tiết: **Manage Tenant Information (UC06)**
- **Actor:** Staff, Manager, Tenant
- **Pre-condition:** Đã đăng nhập vào hệ thống.
- **Post-condition:** Thông tin cá nhân/hồ sơ lưu trú của khách được cập nhật chính xác.
- **Main Flow:**
  1. Nhân viên chọn phòng cụ thể để xem danh sách khách đang cư trú.
  2. Bấm "Thêm khách thuê vào phòng" hoặc "Chỉnh sửa thông tin".
  3. Nhập CCCD, họ tên, quê quán của khách.
  4. Hệ thống kiểm tra trùng lặp CCCD.
  5. Lưu thông tin thành công và cập nhật số người thực tế của phòng.

---

### 👤 THÀNH VIÊN 3: QUẢN LÝ HỢP ĐỒNG THUÊ & ĐẶT CỌC (CONTRACT CRUD)

#### 1. Yêu cầu phần mềm (SWR - Software Requirements)
- **SWR3.1:** Cho phép tạo Hợp đồng thuê phòng mới khi khách vào ở, liên kết chặt chẽ giữa 1 Khách thuê (`TenantId`) và 1 Phòng trống (`RoomId`).
- **SWR3.2:** Bắt buộc nhập các điều khoản: Ngày bắt đầu, Ngày kết thúc, Tiền đặt cọc (`depositAmount`), Giá thuê thỏa thuận hàng tháng.
- **SWR3.3:** Khi hợp đồng được kích hoạt (`ACTIVE`), trạng thái của phòng tự động chuyển sang `RENTED`.
- **SWR3.4:** Hỗ trợ gia hạn hợp đồng (cập nhật ngày kết thúc mới) hoặc thanh lý/chấm dứt hợp đồng (`TERMINATED`), tự động hoàn trả phòng về trạng thái `AVAILABLE`.

#### 2. Kế hoạch kiểm thử (SWT - Software Testing Test Cases)
| Test Case ID | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| **TC_CTR_01** | Tạo hợp đồng với phòng đang trống | Chọn Phòng trống, nhập tiền cọc và thời hạn 6 tháng | Tạo hợp đồng thành công, phòng chuyển sang `RENTED`. |
| **TC_CTR_02** | Tạo hợp đồng với phòng đã có người ở | Chọn phòng trạng thái `RENTED` | Hệ thống báo lỗi "Phòng đang được thuê, không thể tạo hợp đồng mới". |
| **TC_CTR_03** | Gia hạn hợp đồng | Thay đổi `endDate` từ 31/12/2026 thành 30/06/2027 | Hợp đồng gia hạn thành công. |
| **TC_CTR_04** | Thanh lý hợp đồng trước hạn | Bấm thanh lý hợp đồng `status = TERMINATED` | Hợp đồng kết thúc, phòng tự động chuyển về `AVAILABLE`. |

#### 3. Đặc tả Use Case chi tiết: **Manage Contract (UC05)**
- **Actor:** Staff, Manager
- **Pre-condition:** Phòng đã chọn phải ở trạng thái trống (`AVAILABLE`) và khách thuê đã có tài khoản trên hệ thống.
- **Post-condition:** Hợp đồng có hiệu lực pháp lý trên hệ thống, phòng được khóa trạng thái.
- **Main Flow:**
  1. Nhân viên chọn chức năng "Lập hợp đồng mới".
  2. Chọn mã phòng trống và chọn khách thuê từ danh bạ.
  3. Nhập số tiền cọc, giá thuê, thời hạn thuê.
  4. Hệ thống xác nhận và tạo bản ghi Hợp đồng.
  5. Cập nhật trạng thái phòng sang `RENTED`.

---

### 👤 THÀNH VIÊN 4: ĐIỆN NƯỚC, HÓA ĐƠN & THANH TOÁN VNPAY (UTILITY & INVOICE CRUD)

#### 1. Yêu cầu phần mềm (SWR - Software Requirements)
- **SWR4.1:** Cho phép Nhân viên ghi chỉ số công tơ điện và nước hàng tháng cho từng phòng (`previousElec`, `currentElec`, `previousWater`, `currentWater`).
- **SWR4.2:** Hệ thống tự động kiểm tra logic: Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ.
- **SWR4.3:** Tự động tính toán tổng tiền hóa đơn hàng tháng dựa trên đơn giá dịch vụ đã cấu hình:
  $$\text{Tổng tiền} = \text{Tiền phòng} + (\text{Điện tiêu thụ} \times \text{Giá điện}) + (\text{Nước tiêu thụ} \times \text{Giá nước}) + \text{Phí khác}$$
- **SWR4.4:** Tích hợp Cổng thanh toán **VNPay API Sandbox**: Cho phép khách quét mã QR để thanh toán online; nhận phản hồi Webhook IPN để tự động chuyển trạng thái hóa đơn sang `PAID`.
- **SWR4.5:** Hỗ trợ xác nhận thanh toán tiền mặt thủ công khi khách trả trực tiếp cho nhân viên.

#### 2. Kế hoạch kiểm thử (SWT - Software Testing Test Cases)
| Test Case ID | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| **TC_INV_01** | Nhập chỉ số điện nước hợp lệ | Số điện cũ: 100, mới: 150 (tiêu thụ: 50 kWh) | Lưu chỉ số thành công, sản lượng tính đúng 50. |
| **TC_INV_02** | Nhập chỉ số mới nhỏ hơn số cũ | Số điện cũ: 100, mới: 80 | Hệ thống báo lỗi "Chỉ số mới không được nhỏ hơn chỉ số cũ". |
| **TC_INV_03** | Tính toán hóa đơn tự động | Phòng: 2tr, Điện: 50*3500=175k, Nước: 5*20000=100k | Hóa đơn hiển thị tổng tiền: 2.275.000 VNĐ. |
| **TC_INV_04** | Tạo URL thanh toán VNPay | Bấm "Thanh toán VNPay" | Sinh link URL thanh toán hợp lệ dẫn sang cổng VNPay. |
| **TC_INV_05** | Xác nhận Webhook thanh toán | Nhận mã IPN `vnp_ResponseCode = 00` | Hóa đơn tự động cập nhật từ `UNPAID` sang `PAID`. |

#### 3. Đặc tả Use Case chi tiết: **Pay Invoice (UC09)**
- **Actor:** Tenant, Payment Gateway (VNPay)
- **Pre-condition:** Khách thuê có hóa đơn chưa thanh toán (`status = UNPAID`).
- **Post-condition:** Hóa đơn đổi thành `PAID`, giao dịch `PaymentTransaction` được ghi nhận.
- **Main Flow:**
  1. Khách mở ứng dụng, chọn mục "Hóa đơn của tôi".
  2. Bấm "Thanh toán qua VNPay".
  3. Hệ thống tạo URL giao dịch chuyển khách sang giao diện VNPay.
  4. Khách thực hiện quét mã VNPAY-QR hoặc nhập thẻ ATM nội địa.
  5. VNPay trừ tiền thành công và gọi Webhook IPN về máy chủ Backend.
  6. Backend xác thực chữ ký (Checksum) và cập nhật hóa đơn sang `PAID`.
  7. Ứng dụng thông báo thanh toán thành công cho khách.

---

## III. MA TRẬN PHÂN CHIA TRÁCH NHIỆM BẢN VẼ UML CHO 4 THÀNH VIÊN

| Thành viên | Bản vẽ Use Case cần phụ trách | Bản vẽ Class / Sequence phụ trách |
| :--- | :--- | :--- |
| **Thành viên 1** | Use Case Diagram: Room & Rental Management | Class Diagram: Lớp `Room` + Sequence: Tìm & Thuê phòng |
| **Thành viên 2** | Use Case Diagram: Authentication & Tenant Profile | Class Diagram: Lớp `User`, `Tenant`, `Staff`, `Manager` (Kế thừa) |
| **Thành viên 3** | Use Case Diagram: Contract & Lease Management | Class Diagram: Lớp `Contract` + Statechart Diagram: Vòng đời Hợp đồng |
| **Thành viên 4** | Use Case Diagram: Utility, Invoicing & VNPay | Class Diagram: Lớp `UtilityReading`, `Invoice`, `PaymentTransaction` + Sequence: Thanh toán VNPay |
