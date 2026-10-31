# TÀI LIỆU PHÂN CHIA CÔNG VIỆC & ĐẶC TẢ CHI TIẾT DỰ ÁN (CHO 4 THÀNH VIÊN)
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Môn học:** Software Design (SWD392) - FPT University  

---

## I. MA TRẬN PHÂN CHIA CÔNG VIỆC TỔNG QUAN (4 THÀNH VIÊN)

| Thành viên | Phân hệ nghiệp vụ đảm nhiệm | Chức năng CRUD cốt lõi | Use Cases phụ trách | Công nghệ & Đối tượng quản lý |
| :--- | :--- | :--- | :--- | :--- |
| **Thành viên 1 (Leader)** | **Quản lý Phòng** *(Room Management)* | **CRUD Room (Phòng trọ)** | • UC02: Search Room<br>• UC04: Manage Room | React Native / React + Node.js + Express + MongoDB (`Room`) |
| **Thành viên 2** | **Quản lý Tài khoản & Khách thuê** *(User & Tenant Management)* | **CRUD Tenant / User** | • UC01: Register / Login<br>• UC06: Manage Tenant Info<br>• UC15: Manage Staff | JWT Auth + bcrypt + MongoDB (`User`, `TenantProfile`) |
| **Thành viên 3 (Đức)** | **Yêu cầu Thuê & Quản lý Hợp đồng** *(Rental Request & Contract Management)* | **CRUD RentalRequest & Contract** | • UC03: Request Rental<br>• UC05: Manage Contract<br>• UC05.1: Extend Contract<br>• UC05.2: Terminate Contract | React Native + Node.js + Express + MongoDB (`RentalRequest`, `Contract`) |
| **Thành viên 4** | **Điện nước, Hóa đơn & Thanh toán** *(Utility, Billing & Payment)* | **CRUD Utility & Invoice** | • UC07: Record Utility Readings<br>• UC08: Generate Monthly Invoice<br>• UC09: Pay Invoice (VNPay) | Logic Service + VNPay Sandbox API + MongoDB (`UtilityReading`, `Invoice`) |

---

## II. ĐẶC TẢ CHI TIẾT TỪNG THÀNH VIÊN

---

### 👤 THÀNH VIÊN 1: QUẢN LÝ PHÒNG TRỌ (ROOM CRUD)

#### 1. Yêu cầu phần mềm (SWR - Software Requirements)
- **SWR1.1:** Hệ thống cho phép Nhân viên/Chủ trọ thêm mới thông tin phòng trọ (Số phòng, Đơn giá cơ bản, Diện tích, Số người tối đa, Tiện ích đi kèm).
- **SWR1.2:** Hệ thống hỗ trợ tìm kiếm và lọc phòng trống theo các tiêu chí: Khoảng giá, tình trạng phòng (`AVAILABLE`, `RENTED`, `MAINTENANCE`).
- **SWR1.3:** Cho phép cập nhật thông tin phòng hoặc đổi trạng thái phòng khi khách dọn vào/dọn ra.
- **SWR1.4:** Khách thuê có thể xem chi tiết thông tin phòng và tiện ích phòng trọ.

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

---

### 👤 THÀNH VIÊN 2: QUẢN LÝ TÀI KHOẢN & KHÁCH THUÊ (TENANT CRUD)

#### 1. Yêu cầu phần mềm (SWR - Software Requirements)
- **SWR2.1:** Cho phép người dùng đăng ký tài khoản bằng Số điện thoại/Email và mật khẩu được mã hóa an toàn (`bcrypt`).
- **SWR2.2:** Cung cấp tính năng Đăng nhập trả về mã định danh bảo mật **JSON Web Token (JWT)** phân chia rõ các vai trò: `TENANT`, `STAFF`, `MANAGER`.
- **SWR2.3:** Hỗ trợ CRUD hồ sơ định danh khách thuê: Họ tên, Số CCCD/Hộ chiếu, Ngày sinh, Quê quán, Ảnh mặt trước/sau CCCD.
- **SWR2.4:** Cho phép Chủ trọ quản lý danh sách nhân viên (Thêm, cấp quyền, khóa tài khoản).

#### 2. Kế hoạch kiểm thử (SWT - Software Testing Test Cases)
| Test Case ID | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| **TC_USER_01** | Đăng ký tài khoản mới hợp lệ | `phoneNumber: "0912345678"`, `password: "Pass123@"` | Đăng ký thành công, mật khẩu trong DB được hash. |
| **TC_USER_02** | Đăng nhập sai mật khẩu | `phoneNumber: "0912345678"`, `password: "SaiPass"` | Báo lỗi "Sai tài khoản hoặc mật khẩu" (Status 401). |
| **TC_USER_03** | Cập nhật hồ sơ CCCD khách thuê | Nhập số CCCD: 12 chữ số hợp lệ | Hồ sơ được cập nhật, trạng thái tạm trú thành công. |
| **TC_USER_04** | Khóa tài khoản nhân viên | Manager chuyển trạng thái `isActive = false` | Tài khoản nhân viên không thể đăng nhập tiếp vào hệ thống. |

---

### 👤 THÀNH VIÊN 3 (ĐỨC): RENTAL REQUEST & CONTRACT MANAGEMENT (CRUD RENTAL REQUEST & CONTRACT)

#### 1. Yêu cầu phần mềm (SWR - Software Requirements)
- **SWR3.1:** Cho phép Khách thuê gửi yêu cầu giữ phòng/thuê phòng (`RentalRequest`) kèm họ tên, SĐT, ngày dự kiến chuyển vào và ghi chú.
- **SWR3.2:** Khách thuê theo dõi được trạng thái yêu cầu của mình (`PENDING`, `APPROVED`, `REJECTED`).
- **SWR3.3:** Cho phép Chủ trọ/Nhân viên duyệt (`APPROVED`) hoặc từ chối (`REJECTED`) yêu cầu thuê; khi duyệt có thể chuyển ngay sang bước lập hợp đồng.
- **SWR3.4:** Cho phép tạo Hợp đồng thuê phòng (`Contract`) với các điều khoản: Ngày bắt đầu, Ngày kết thúc, Tiền đặt cọc (`depositAmount`), Giá thuê thỏa thuận hàng tháng.
- **SWR3.5:** Khi hợp đồng được kích hoạt (`ACTIVE`), trạng thái phòng tự động chuyển sang `RENTED`; không cho phép tạo hợp đồng trùng trên phòng đang thuê.
- **SWR3.6:** Hỗ trợ gia hạn hợp đồng (cập nhật ngày kết thúc mới) hoặc thanh lý hợp đồng (`TERMINATED`), tự động giải phóng phòng về trạng thái `AVAILABLE`.

#### 2. Kế hoạch kiểm thử (SWT - Software Testing Test Cases)
| Test Case ID | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| **TC_RENTAL_01** | Gửi yêu cầu thuê phòng hợp lệ | Chọn phòng `AVAILABLE`, nhập họ tên, SĐT | Gửi thành công (`Status 201`), yêu cầu lưu với trạng thái `PENDING`. |
| **TC_RENTAL_02** | Không cho thuê phòng đã được đặt/đang thuê | Chọn phòng trạng thái `RENTED` hoặc `MAINTENANCE` | Hệ thống báo lỗi (`Status 400`), "Phòng hiện tại không khả dụng để thuê". |
| **TC_CTR_01** | Tạo hợp đồng hợp lệ | Chọn phòng `AVAILABLE`, nhập tiền cọc và thời hạn | Tạo thành công (`Status 201`), phòng chuyển sang `RENTED`. |
| **TC_CTR_02** | Không cho tạo hợp đồng trùng phòng | Chọn phòng đang `RENTED` hoặc đã có hợp đồng `ACTIVE` | Hệ thống báo lỗi (`Status 400`), "Phòng đang có hợp đồng hoạt động hoặc đã được thuê". |
| **TC_CTR_03** | Thanh lý hợp đồng và giải phóng phòng | Hợp đồng đang `ACTIVE`, thực hiện thanh lý | Hợp đồng chuyển `TERMINATED`, phòng tự động chuyển về `AVAILABLE`. |

#### 3. Danh sách màn hình Frontend (React Native)
1. `RentalRequestScreen`: Khách gửi yêu cầu thuê phòng.
2. `MyRentalRequestScreen`: Khách xem trạng thái yêu cầu thuê của mình.
3. `RequestManagementScreen`: Chủ trọ duyệt hoặc từ chối yêu cầu thuê.
4. `ContractListScreen`: Danh sách hợp đồng thuê phòng.
5. `ContractDetailScreen`: Chi tiết hợp đồng, thực hiện gia hạn hoặc thanh lý.
6. `ManageContractScreen`: Form tạo mới hợp đồng (hỗ trợ prefill từ yêu cầu thuê).

#### 4. Danh sách API Backend (Node.js / Express)
- `POST /api/rental-requests`: Gửi yêu cầu thuê phòng.
- `GET /api/rental-requests`: Lấy danh sách yêu cầu thuê.
- `GET /api/rental-requests/:id`: Chi tiết yêu cầu thuê.
- `PUT /api/rental-requests/:id`: Duyệt hoặc từ chối yêu cầu.
- `POST /api/contracts`: Tạo hợp đồng mới.
- `GET /api/contracts`: Lấy danh sách hợp đồng.
- `GET /api/contracts/:id`: Chi tiết hợp đồng.
- `PUT /api/contracts/:id/extend`: Gia hạn hợp đồng.
- `PUT /api/contracts/:id/terminate`: Thanh lý hợp đồng.

---

### 👤 THÀNH VIÊN 4: ĐIỆN NƯỚC, HÓA ĐƠN & THANH TOÁN VNPAY (UTILITY & INVOICE CRUD)

#### 1. Yêu cầu phần mềm (SWR - Software Requirements)
- **SWR4.1:** Cho phép Nhân viên ghi chỉ số công tơ điện và nước hàng tháng cho từng phòng (`previousElec`, `currentElec`, `previousWater`, `currentWater`).
- **SWR4.2:** Hệ thống tự động kiểm tra logic: Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ.
- **SWR4.3:** Tự động tính toán tổng tiền hóa đơn hàng tháng dựa trên đơn giá dịch vụ đã cấu hình.
- **SWR4.4:** Tích hợp Cổng thanh toán **VNPay API Sandbox**: Cho phép khách quét mã QR để thanh toán online; nhận phản hồi Webhook IPN để tự động chuyển trạng thái hóa đơn sang `PAID`.
- **SWR4.5:** Hỗ trợ xác nhận thanh toán tiền mặt thủ công khi khách trả trực tiếp cho nhân viên.

#### 2. Kế hoạch kiểm thử (SWT - Software Testing Test Cases)
| Test Case ID | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
| **TC_INV_01** | Nhập chỉ số điện nước hợp lệ | Số điện cũ: 100, mới: 150 (tiêu thụ: 50 kWh) | Lưu chỉ số thành công, sản lượng tính đúng 50. |
| **TC_INV_02** | Nhập chỉ số mới nhỏ hơn số cũ | Số điện cũ: 100, mới: 80 | Hệ thống báo lỗi "Chỉ số mới không được nhỏ hơn chỉ số cũ". |
| **TC_INV_03** | Tính toán hóa đơn tự động | Tiền phòng + Điện + Nước | Hóa đơn hiển thị tổng tiền chính xác. |
| **TC_INV_04** | Tạo URL thanh toán VNPay | Bấm "Thanh toán VNPay" | Sinh link URL thanh toán hợp lệ dẫn sang cổng VNPay. |
| **TC_INV_05** | Xác nhận Webhook thanh toán | Nhận mã IPN `vnp_ResponseCode = 00` | Hóa đơn tự động cập nhật từ `UNPAID` sang `PAID`. |

---

## III. MA TRẬN PHÂN CHIA TRÁCH NHIỆM BẢN VẼ UML CHO 4 THÀNH VIÊN

| Thành viên | Bản vẽ Use Case cần phụ trách | Bản vẽ Class / Sequence / State Machine phụ trách |
| :--- | :--- | :--- |
| **Thành viên 1** | Use Case Diagram: Room Management | Class Diagram: Lớp `Room` |
| **Thành viên 2** | Use Case Diagram: Authentication & Tenant Profile | Class Diagram: Lớp `User`, `Tenant`, `Staff`, `Manager` (Kế thừa) |
| **Thành viên 3 (Đức)** | **Use Case Diagram: Rental & Contract Management** | **Class Diagram: Lớp `RentalRequest`, `Contract` + State Machine Diagram: Vòng đời Hợp đồng + Sequence Diagram: Quy trình thuê phòng** *(Xem chi tiết tại `docs/UML_RENTAL_CONTRACT.md`)* |
| **Thành viên 4** | Use Case Diagram: Utility, Invoicing & VNPay | Class Diagram: Lớp `UtilityReading`, `Invoice`, `PaymentTransaction` + Sequence: Thanh toán VNPay |
