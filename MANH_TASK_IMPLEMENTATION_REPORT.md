# BÁO CÁO THỰC HIỆN NHIỆM VỤ - THÀNH VIÊN 4: NGUYỄN VĂN MẠNH
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Môn học:** Software Design (SWD392) - FPT University  
**Phân hệ đảm nhiệm:** Điện nước, Hóa đơn & Thanh toán VNPay *(Utility, Billing & Payment)*  
**Nhánh Git:** `manh` (Tạo từ nhánh `origin/duc` & đồng bộ tiêu chuẩn dự án)

---

## 1. TỔNG QUAN PHÂN HỆ VÀ USE CASE PHỤ TRÁCH

| Tiêu chí | Nội dung chi tiết |
| :--- | :--- |
| **Thành viên thực hiện** | **Nguyễn Văn Mạnh (Thành viên 4)** |
| **Phân hệ nghiệp vụ** | **Utility, Billing & VNPay Payment** (Điện nước, Hóa đơn & Thanh toán) |
| **Chức năng CRUD cốt lõi** | **CRUD Utility & Invoice** |
| **Use Cases phụ trách** | • **UC07: Record Utility Readings** (Ghi chỉ số điện nước hàng tháng)<br>• **UC08: Generate Monthly Invoice** (Lập hóa đơn hàng tháng tự động)<br>• **UC09: Pay Invoice** (Thanh toán trực tuyến qua Cổng VNPay Sandbox)<br>• **UC10: Confirm Cash Payment** (Xác nhận thu tiền mặt tại quầy) |
| **Công nghệ & Thư viện** | Node.js, Express, MongoDB (Mongoose), Crypto (SHA512 VNPay), ReactJS (Vite), Axios |

---

## 2. THIẾT KẾ CƠ SỞ DỮ LIỆU & ENTITY SCHEMAS

### 2.1. Schema `UtilityReading` (`backend/models/UtilityReading.js`)
* Collection: `utilities`
* Các trường: `roomId` (ref Room), `month` (YYYY-MM), `oldElec`, `newElec`, `electricUsage`, `oldWater`, `newWater`, `waterUsage`, `readingDate`, `recordedBy`, `note`.
* **Validation & Business Hook:** Kiểm tra `newElec >= oldElec` và `newWater >= oldWater`, tự động tính lượng tiêu thụ `electricUsage` và `waterUsage`.

### 2.2. Schema `Invoice` (`backend/models/Invoice.js`)
* Collection: `invoices`
* Các trường: `invoiceCode` (Unique), `roomId`, `contractId`, `tenantName`, `tenantPhone`, `month`, `roomAmount`, `oldElec`, `newElec`, `electricUsage`, `electricPrice`, `electricAmount`, `oldWater`, `newWater`, `waterUsage`, `waterPrice`, `waterAmount`, `internetFee`, `garbageFee`, `otherFees`, `totalAmount`, `status` (`UNPAID`, `PAID`, `OVERDUE`), `paymentMethod` (`NONE`, `CASH`, `VNPAY`), `dueDate`, `paidAt`, `note`.
* **Business Hook:** Tự động tính tiền điện (`electricUsage * electricPrice`), tiền nước (`waterUsage * waterPrice`) và tổng thanh toán `totalAmount`.

### 2.3. Schema `PaymentTransaction` (`backend/models/PaymentTransaction.js`)
* Collection: `payment_transactions`
* Lưu vết lịch sử giao dịch: `invoiceId`, `transactionCode`, `amount`, `paymentMethod`, `bankCode`, `vnpayTxnRef`, `vnpayTransactionNo`, `vnpayResponseCode`, `status`, `paidAt`.

---

## 3. DANH SÁCH RESTFUL APIS ĐÃ XÂY DỰNG

| Method | Endpoint | Mô tả chức năng | Use Case |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/utilities` | Lấy danh sách chỉ số điện nước đã chốt | UC07 |
| `POST` | `/api/utilities` | Ghi nhận chỉ số điện nước (Validate số mới >= số cũ) | UC07 / SWR4.1, SWR4.2 |
| `GET` | `/api/utilities/latest/:roomId` | Lấy chỉ số kỳ trước của phòng để tự điền số cũ | UC07 |
| `PUT` | `/api/utilities/:id` | Sửa chỉ số điện nước | UC07 |
| `DELETE` | `/api/utilities/:id` | Xóa bản ghi chỉ số | UC07 |
| `GET` | `/api/invoices` | Lấy danh sách hóa đơn theo tháng/trạng thái | UC08 |
| `POST` | `/api/invoices/generate` | Lập hóa đơn tự động (Chỉ cho phòng có hợp đồng ACTIVE) | UC08 / SWR4.3 |
| `GET` | `/api/invoices/:id` | Xem chi tiết 1 hóa đơn | UC08, UC09 |
| `POST` | `/api/invoices/:id/pay-cash` | Xác nhận thu tiền mặt và chuyển sang PAID | UC10 / SWR4.5 |
| `POST` | `/api/payment/create-payment-url` | Sinh link thanh toán VNPay Sandbox có checksum SHA512 | UC09 / SWR4.4 |
| `GET` | `/api/payment/vnpay-return` | Xử lý khách quay lại từ cổng VNPay | UC09 |
| `GET` | `/api/payment/vnpay-ipn` | Webhook IPN nhận kết quả thanh toán từ VNPay Server | UC09 / SWR4.4 |
| `GET` | `/api/payment/transactions` | Lịch sử các giao dịch thanh toán | UC09, UC10 |

---

## 4. GIAO DIỆN CLIENT FRONTEND (REACTJS)

1. **`ManageUtilitiesScreen.jsx`:**
   - Màn hình ghi chốt chỉ số điện nước hàng tháng.
   - Khi chọn phòng, tự động tải chỉ số tháng trước điền vào "Số cũ".
   - Tính toán real-time sản lượng điện kWh, nước m³ và cảnh báo màu đỏ nếu nhập số mới < số cũ.
   - Nút tắt chuyển nhanh sang lập hóa đơn.

2. **`ManageInvoicesScreen.jsx`:**
   - Quản lý danh sách hóa đơn: Lọc theo trạng thái (`UNPAID`, `PAID`, `OVERDUE`) và lọc theo tháng.
   - Form lập hóa đơn tự động liên kết Hợp đồng `ACTIVE` và số điện nước đã chốt.
   - Modal chi tiết hóa đơn: Hiển thị đầy đủ bảng chiết tính chi phí và 2 tùy chọn thanh toán:
     - 🏦 **Cổng VNPay Sandbox**: Nhấn để chuyển hướng sang trang thanh toán ngân hàng VNPay.
     - 💵 **Thu tiền mặt trực tiếp**: Xác nhận tại quầy và chuyển ngay trạng thái hóa đơn sang `PAID`.

3. **Điều hướng `Navbar.jsx` & Tích hợp `App.jsx`:**
   - Bổ sung 2 tab điều hướng: `⚡ Điện & Nước` và `🧾 Hóa đơn & VNPay`.
   - Lắng nghe và xử lý tự động khi VNPay trả về kết quả qua URL callback.

---

## 5. KẾT QUẢ KIỂM THỬ (100% TEST CASES ĐẠT YÊU CẦU)

Chạy kiểm thử: `npm run test:invoice` tại `backend/`:

| Test Case ID | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_INV_01** | Nhập chỉ số điện nước hợp lệ | Cũ: 100, Mới: 150 (Điện); Cũ: 10, Mới: 15 (Nước) | Lưu thành công, điện tiêu thụ: 50, nước tiêu thụ: 5. | Đã tính đúng 50 kWh và 5 m³. | **PASS ✅** |
| **TC_INV_02** | Nhập chỉ số mới nhỏ hơn chỉ số cũ | Số điện cũ: 100, Mới: 80 | Hệ thống báo lỗi "Chỉ số điện mới không được nhỏ hơn chỉ số cũ". | Hệ thống phát hiện và chặn đúng thông báo lỗi. | **PASS ✅** |
| **TC_INV_03** | Tính toán hóa đơn tự động | Phòng: 2.000.000, Điện: 50 * 3500 = 175.000, Nước: 5 * 20.000 = 100.000 | Tổng tiền hóa đơn: 2.275.000 VNĐ. | Hóa đơn tự động tính chính xác: 2.275.000 VNĐ. | **PASS ✅** |
| **TC_INV_04** | Tạo URL thanh toán VNPay Sandbox | Bấm tạo link thanh toán cho hóa đơn vừa lập | Sinh link URL dẫn sang `sandbox.vnpayment.vn` kèm tham số checksum băm SHA512 hợp lệ. | Đã sinh link URL thanh toán chuẩn VNPay thành công. | **PASS ✅** |
| **TC_INV_05** | Xác nhận Webhook thanh toán VNPay | Nhận mã IPN `vnp_ResponseCode = 00` kèm checksum | Hóa đơn tự động cập nhật từ `UNPAID` sang `PAID`. | Xác thực chữ ký băm thành công, hóa đơn đã chuyển sang `PAID`. | **PASS ✅** |
