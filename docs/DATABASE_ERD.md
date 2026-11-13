# SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE ERD)
## Hệ Thống Quản Lý Nhà Trọ & Căn Hộ Dịch Vụ (Motel Management System)

Sơ đồ quan hệ thực thể giữa các Collection trong cơ sở dữ liệu MongoDB theo kiến trúc Mongoose ODM.

```mermaid
erDiagram
    USER ||--o{ RENTAL_REQUEST : "gửi yêu cầu thuê"
    USER ||--o{ CONTRACT : "ký kết hợp đồng"
    ROOM ||--o{ RENTAL_REQUEST : "được yêu cầu giữ chỗ"
    ROOM ||--o{ CONTRACT : "được ký hợp đồng thuê"
    ROOM ||--o{ UTILITY_READING : "ghi chỉ số điện nước"
    CONTRACT ||--o{ INVOICE : "lập hóa đơn thanh toán"
    UTILITY_READING ||--o| INVOICE : "áp chỉ số tính tiền"

    USER {
        ObjectId _id PK
        string fullName "Họ và tên"
        string email "Email đăng nhập"
        string phone "Số điện thoại đăng nhập"
        string password "Mật khẩu mã hóa Bcrypt"
        string role "MANAGER | STAFF | TENANT"
        string identityNumber "CCCD 12 chữ số"
        date identityIssuedDate "Ngày cấp CCCD"
        string identityIssuedPlace "Nơi cấp CCCD"
        string hometown "Quê quán / Thường trú"
        string currentAddress "Địa chỉ liên hệ hiện tại"
        date dateOfBirth "Ngày sinh"
        string gender "MALE | FEMALE | OTHER"
        string temporaryResidenceStatus "NOT_REGISTERED | PENDING | REGISTERED"
        ObjectId currentRoom FK "Tham chiếu Phòng đang thuê"
        boolean isActive "Trạng thái hoạt động"
    }

    ROOM {
        ObjectId _id PK
        string roomNumber "Mã số phòng (Duy nhất)"
        number basePrice "Đơn giá thuê cơ bản (VNĐ/tháng)"
        number area "Diện tích phòng (m²)"
        number maxOccupants "Sức chứa tối đa (người)"
        stringArray amenities "Tiện nghi [Wifi, Nóng lạnh, ĐH...]"
        string status "AVAILABLE | RENTED | MAINTENANCE"
        string description "Mô tả chi tiết phòng"
        stringArray images "Danh sách URL hình ảnh"
    }

    RENTAL_REQUEST {
        ObjectId _id PK
        ObjectId userId FK "Khách thuê gửi yêu cầu"
        ObjectId roomId FK "Phòng muốn giữ chỗ"
        string tenantName "Họ tên khách thuê"
        string tenantPhone "Số điện thoại liên hệ"
        date expectedMoveInDate "Ngày dự kiến dọn vào"
        string status "PENDING | APPROVED | REJECTED"
        string note "Ghi chú & thông tin pháp lý CCCD"
        string rejectionReason "Lý do từ chối nếu không duyệt"
    }

    CONTRACT {
        ObjectId _id PK
        string contractNumber "Mã số hợp đồng duy nhất"
        ObjectId roomId FK "Phòng cho thuê"
        ObjectId tenantId FK "Tài khoản khách thuê (Bên B)"
        ObjectId landlordId FK "Người đại diện lập HĐ (Bên A)"
        string roomNumber "Số phòng tại thời điểm ký"
        string landlordName "Họ tên Bên A"
        string landlordCccd "Số CCCD Bên A"
        string landlordPhone "SĐT Bên A"
        string tenantName "Họ tên Bên B"
        string tenantCccd "Số CCCD Bên B"
        string tenantPhone "SĐT Bên B"
        date startDate "Ngày bắt đầu hiệu lực"
        date endDate "Ngày kết thúc hợp đồng"
        number rentalPrice "Giá thuê thỏa thuận"
        number depositAmount "Tiền đặt cọc"
        string status "DRAFT | ACTIVE | EXPIRED | TERMINATED"
        boolean isSigned "Xác nhận ký tên số từ Khách thuê"
        date signedAt "Thời điểm ký tên"
    }

    UTILITY_READING {
        ObjectId _id PK
        ObjectId roomId FK "Phòng chốt chỉ số"
        string roomNumber "Số phòng"
        number month "Tháng ghi nhận (1-12)"
        number year "Năm ghi nhận"
        number prevElectricity "Chỉ số điện đầu kỳ (kWh)"
        number currentElectricity "Chỉ số điện cuối kỳ (kWh)"
        number electricUsage "Sản lượng điện tiêu thụ"
        number prevWater "Chỉ số nước đầu kỳ (m³)"
        number currentWater "Chỉ số nước cuối kỳ (m³)"
        number waterUsage "Khối lượng nước tiêu thụ"
        date recordedDate "Thời điểm ghi nhận"
        ObjectId recordedBy FK "Nhân viên ghi chỉ số"
        string status "RECORDED | INVOICED"
    }

    INVOICE {
        ObjectId _id PK
        string invoiceCode "Mã hóa đơn duy nhất (INV-...)"
        ObjectId contractId FK "Hợp đồng tham chiếu"
        ObjectId roomId FK "Phòng trọ"
        ObjectId tenantId FK "Khách thuê chịu trách nhiệm"
        string tenantName "Họ tên người nhận hóa đơn"
        string tenantPhone "Số điện thoại"
        number month "Kỳ hóa đơn (tháng)"
        number year "Kỳ hóa đơn (năm)"
        number roomPrice "Tiền phòng thỏa thuận"
        number electricityFee "Tiền điện tiêu thụ"
        number waterFee "Tiền nước tiêu thụ"
        number internetFee "Phí dịch vụ internet"
        number totalAmount "Tổng số tiền cần thanh toán (VNĐ)"
        string status "UNPAID | PAID | OVERDUE"
        string paymentMethod "CASH | VNPAY"
        string paymentTransactionId "Mã giao dịch VNPay"
        date paidAt "Thời điểm thanh toán"
    }
```
