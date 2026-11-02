# TÀI LIỆU THIẾT KẾ UML & ĐẶC TẢ PHÂN HỆ: UTILITY, INVOICE & PAYMENT MANAGEMENT
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Môn học:** Software Design (SWD392) - FPT University  
**Phụ trách:** Thành viên 4 – Nguyễn Văn Mạnh  
**Phân hệ:** Utility, Billing & Payment Management  

---

## 1. USE CASE DIAGRAM – UTILITY, INVOICE & PAYMENT

```mermaid
flowchart LR
    %% Actors
    Tenant(["👤 Khách thuê (Tenant)"])
    Staff(["👤 Nhân viên (Staff)"])
    Manager(["👤 Chủ trọ (Manager)"])
    VNPayGateway(["🏦 Cổng thanh toán (VNPay / Mock)"])

    Manager -->|Kế thừa quyền| Staff

    subgraph SystemBoundary ["Phân hệ Quản lý Điện Nước & Thanh Toán Hóa Đơn"]
        UC07(["UC07: Ghi chỉ số điện nước (Record Utility Readings)"])
        UC08(["UC08: Lập hóa đơn hàng tháng (Generate Monthly Invoice)"])
        UC09(["UC09: Thanh toán hóa đơn (Pay Invoice)"])
        UC10(["UC10: Xác nhận thu tiền mặt (Confirm Cash Payment)"])
        UC_ViewInv(["Xem danh sách & chi tiết hóa đơn"])
        UC_ViewHistory(["Xem lịch sử giao dịch thanh toán"])

        UC08 -.->|"<<include>>"| UC_ViewInv
        UC09 -.->|"<<include>>"| UC08
        UC09 -.->|"<<include>>"| UC_ViewHistory
        UC10 -.->|"<<include>>"| UC_ViewHistory
    end

    Staff --> UC07
    Staff --> UC08
    Staff --> UC10
    Staff --> UC_ViewInv
    Staff --> UC_ViewHistory

    Tenant --> UC_ViewInv
    Tenant --> UC09
    Tenant --> UC_ViewHistory

    UC09 <--> VNPayGateway
```

---

## 2. SEQUENCE DIAGRAM – QUY TRÌNH THANH TOÁN HÓA ĐƠN (PAY INVOICE SEQUENCE)

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Khách thuê (Tenant)
    actor Staff as Nhân viên / Chủ trọ
    participant App as Mobile (React Native) / Web
    participant Backend as Express Server
    participant DB as MongoDB (invoices, payment_transactions)
    participant VNPay as Cổng thanh toán VNPay / Mock

    %% Giai đoạn 1: Lập hóa đơn tháng
    Staff->>App: Chọn phòng & tháng cần lập hóa đơn
    App->>Backend: POST /api/invoices/generate
    Backend->>DB: Kiểm tra Hợp đồng ACTIVE & chỉ số điện nước (utilities)
    Backend->>DB: Invoice.create(status: "UNPAID")
    DB-->>Backend: Saved Invoice
    Backend-->>App: 201 Created (Hóa đơn sẵn sàng thanh toán)

    %% Giai đoạn 2: Khách thuê thanh toán
    Tenant->>App: Mở InvoiceDetailScreen, xem tổng tiền (TC_INV_02)
    alt Lựa chọn 1: Thanh toán Online qua VNPay (UC09)
        Tenant->>App: Nhấn "Thanh toán qua VNPay"
        App->>Backend: POST /api/payment/create-payment-url (hoặc /api/payments)
        Backend->>VNPay: Tạo link thanh toán kèm checksum SHA512
        VNPay-->>Backend: URL Thanh toán VNPay Sandbox
        Backend-->>App: Trả về paymentUrl
        App->>Tenant: Chuyển hướng sang VNPay quét QR / Thẻ ATM
        Tenant->>VNPay: Xác nhận thanh toán mã OTP
        VNPay->>Backend: Webhook IPN Callback (vnp_ResponseCode = 00)
        Backend->>DB: Cập nhật invoice (status: "PAID", paymentMethod: "VNPAY")
        Backend->>DB: Lưu PaymentTransaction (TC_INV_03)
        Backend-->>App: Thông báo thanh toán thành công
        App-->>Tenant: Hiển thị hóa đơn ĐÃ THANH TOÁN
    else Lựa chọn 2: Thu tiền mặt tại quầy (UC10)
        Tenant->>Staff: Giao tiền mặt trực tiếp
        Staff->>App: Nhấn "Xác nhận thu tiền mặt"
        App->>Backend: PUT /api/invoices/:id/payment (hoặc POST pay-cash)
        alt Hóa đơn đã PAID từ trước (TC_INV_04)
            Backend-->>App: 400 Bad Request ("Hóa đơn đã được thanh toán trước đó")
            App-->>Staff: Báo lỗi chặn thanh toán trùng!
        else Hợp lệ
            Backend->>DB: invoice.status = "PAID", paymentMethod = "CASH"
            Backend->>DB: PaymentTransaction.create()
            DB-->>Backend: Updated Records
            Backend-->>App: 200 OK (Thành công)
            App-->>Staff: Hóa đơn chuyển trạng thái PAID
        end
    end
```

---

## 3. CLASS DIAGRAM – THỰC THỂ CƠ SỞ DỮ LIỆU (MONGODB COLLECTIONS)

```mermaid
classDiagram
    class Room {
        +ObjectId _id
        +String roomNumber
        +Number basePrice
        +String status
    }

    class Contract {
        +ObjectId _id
        +ObjectId roomId
        +String tenantName
        +Number rentalPrice
        +String status
    }

    class UtilityReading {
        +ObjectId _id
        +ObjectId roomId
        +String month
        +Number oldElectricIndex
        +Number newElectricIndex
        +Number oldWaterIndex
        +Number newWaterIndex
        +Number electricUsage
        +Number waterUsage
        +Date readingDate
        +String recordedBy
    }

    class Invoice {
        +ObjectId _id
        +String invoiceCode
        +ObjectId contractId
        +ObjectId roomId
        +ObjectId tenantId
        +String tenantName
        +String month
        +Number roomPrice
        +Number electricCost
        +Number waterCost
        +Number internetFee
        +Number garbageFee
        +Number totalAmount
        +String status
        +Date dueDate
        +String paymentMethod
        +Date paidAt
    }

    class PaymentTransaction {
        +ObjectId _id
        +ObjectId invoiceId
        +String transactionCode
        +Number amount
        +String paymentMethod
        +String status
        +Date paidAt
    }

    Room "1" <-- "0..*" UtilityReading : roomId
    Room "1" <-- "0..*" Contract : roomId
    Contract "1" <-- "0..*" Invoice : contractId
    Room "1" <-- "0..*" Invoice : roomId
    Invoice "1" <-- "0..*" PaymentTransaction : invoiceId
```

---

## 4. BẢNG TEST CASES CHI TIẾT THEO YÊU CẦU

| Test Case ID | Tên ca kiểm thử | Mô tả & Dữ liệu đầu vào | Kết quả mong đợi | Trạng thái thực tế |
| :--- | :--- | :--- | :--- | :---: |
| **TC_INV_01** | Chỉ số điện nước mới nhỏ hơn chỉ số cũ | Nhập số điện cũ: 100, mới: 80 | Hệ thống báo lỗi: "Chỉ số điện mới không được nhỏ hơn chỉ số cũ", từ chối lưu. | **PASS ✅** |
| **TC_INV_02** | Tính tổng hóa đơn chính xác | Tiền phòng: 2.000.000, Điện: 50 kWh * 3500 = 175.000, Nước: 5 m³ * 20.000 = 100.000 | Tổng tiền hóa đơn tự tính chính xác: 2.275.000 VNĐ. | **PASS ✅** |
| **TC_INV_03** | Thanh toán hóa đơn thành công | Khách thanh toán hóa đơn UNPAID qua VNPay / Tiền mặt | Hóa đơn đổi sang `PAID`, giao dịch được lưu vào `payment_transactions` trên MongoDB. | **PASS ✅** |
| **TC_INV_04** | Không thanh toán trùng hóa đơn | Cố ý gửi yêu cầu thanh toán lần 2 cho hóa đơn đã `PAID` | Hệ thống chặn lại, báo lỗi "Hóa đơn này đã được thanh toán trước đó!". | **PASS ✅** |
