# TÀI LIỆU UML & ĐẶC TẢ PHÂN HỆ: RENTAL REQUEST & CONTRACT MANAGEMENT
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Môn học:** Software Design (SWD392) - FPT University  
**Phân hệ phụ trách:** Rental Request & Contract Management  

---

## 1. USE CASE DIAGRAM (Sơ đồ Use Case - Rental & Contract)

```mermaid
flowchart LR
    %% Actors
    Tenant(["👤 Khách thuê (Tenant)"])
    Staff(["👤 Nhân viên (Staff)"])
    Manager(["👤 Chủ trọ (Manager)"])

    Manager -->|Kế thừa quyền| Staff

    subgraph SystemBoundary ["Hệ thống Quản lý Nhà trọ (Motel Management System)"]
        UC03(["UC03: Gửi yêu cầu thuê phòng (Request Rental)"])
        UC03_1(["Xem trạng thái yêu cầu của tôi"])
        UC03_2(["Duyệt / Từ chối yêu cầu thuê"])
        UC05(["UC05: Lập hợp đồng mới (Manage Contract)"])
        UC05_1(["UC05.1: Gia hạn hợp đồng (Extend Contract)"])
        UC05_2(["UC05.2: Thanh lý hợp đồng (Terminate Contract)"])
        UC05_3(["Xem chi tiết & danh sách hợp đồng"])

        UC03_2 -.->|"<<extends>>"| UC05
        UC05 -.->|"<<include>>"| UC05_3
        UC05_1 -.->|"<<extend>>"| UC05
        UC05_2 -.->|"<<extend>>"| UC05
    end

    Tenant --> UC03
    Tenant --> UC03_1
    Staff --> UC03_2
    Staff --> UC05
    Staff --> UC05_1
    Staff --> UC05_2
    Staff --> UC05_3
```

---

## 2. STATE MACHINE DIAGRAM (Sơ đồ trạng thái - Vòng đời Hợp đồng)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Nhân viên khởi tạo nháp
    [*] --> ACTIVE : Tạo và kích hoạt hợp đồng (TC_CTR_01)
    
    DRAFT --> ACTIVE : Đặt cọc & Ký xác nhận
    DRAFT --> CANCELLED : Hủy lập hợp đồng

    ACTIVE --> ACTIVE : Gia hạn hợp đồng (Extend Contract - UC05.1)
    ACTIVE --> EXPIRED : Đến ngày kết thúc (endDate) mà không gia hạn
    ACTIVE --> TERMINATED : Thanh lý hợp đồng (Terminate Contract - UC05.2 / TC_CTR_03)

    EXPIRED --> TERMINATED : Hoàn tất thủ tục trả cọc & trả phòng
    
    note right of ACTIVE
      Phòng chuyển sang RENTED
      Không cho phép tạo HĐ trùng (TC_CTR_02)
    end note

    note right of TERMINATED
      Giải phóng phòng về trạng thái AVAILABLE
    end note

    TERMINATED --> [*]
    CANCELLED --> [*]
```

---

## 3. SEQUENCE DIAGRAM (Sơ đồ tuần tự - Quy trình Thuê phòng & Ký Hợp đồng)

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Khách thuê (Tenant)
    actor Staff as Chủ trọ / Nhân viên
    participant MobileApp as React Native App
    participant Backend as Express Server
    participant DB as MongoDB (Room, RentalRequest, Contract)

    %% Bước 1: Gửi yêu cầu thuê phòng
    Tenant->>MobileApp: Mở RentalRequestScreen, chọn phòng trống
    Tenant->>MobileApp: Nhập họ tên, SĐT, ngày dự kiến, ghi chú
    Tenant->>MobileApp: Nhấn "Gửi yêu cầu" (TC_RENTAL_01)
    MobileApp->>Backend: POST /api/rental-requests
    Backend->>DB: Room.findById(roomId)
    alt Phòng không ở trạng thái AVAILABLE (TC_RENTAL_02)
        DB-->>Backend: Room status != AVAILABLE
        Backend-->>MobileApp: 400 Bad Request ("Phòng không khả dụng")
        MobileApp-->>Tenant: Hiển thị thông báo lỗi
    else Phòng hợp lệ AVAILABLE
        Backend->>DB: RentalRequest.create(status: "PENDING")
        DB-->>Backend: Saved RentalRequest
        Backend-->>MobileApp: 201 Created (Success)
        MobileApp-->>Tenant: Thông báo gửi yêu cầu thành công
    end

    %% Bước 2: Chủ trọ duyệt yêu cầu
    Staff->>MobileApp: Mở RequestManagementScreen
    MobileApp->>Backend: GET /api/rental-requests?status=PENDING
    Backend->>DB: RentalRequest.find()
    DB-->>Backend: Danh sách yêu cầu
    Backend-->>MobileApp: 200 OK (Render danh sách)
    Staff->>MobileApp: Nhấn "Phê duyệt" (status: APPROVED)
    MobileApp->>Backend: PUT /api/rental-requests/:id { status: "APPROVED" }
    Backend->>DB: RentalRequest.findByIdAndUpdate()
    DB-->>Backend: Updated RentalRequest
    Backend-->>MobileApp: 200 OK (Duyệt thành công)

    %% Bước 3: Lập hợp đồng chính thức
    Staff->>MobileApp: Chuyển sang ManageContractScreen (Prefill thông tin)
    Staff->>MobileApp: Nhập tiền cọc, giá thuê, ngày bắt đầu - kết thúc
    Staff->>MobileApp: Nhấn "Xác nhận lập hợp đồng" (TC_CTR_01)
    MobileApp->>Backend: POST /api/contracts
    Backend->>DB: Kiểm tra phòng và hợp đồng ACTIVE hiện tại (TC_CTR_02)
    alt Đã có hợp đồng ACTIVE trùng phòng
        Backend-->>MobileApp: 400 Bad Request ("Phòng đang có hợp đồng hoạt động")
        MobileApp-->>Staff: Báo lỗi trùng phòng
    else Hợp lệ
        Backend->>DB: Contract.create(status: "ACTIVE")
        Backend->>DB: Room.findByIdAndUpdate(roomId, { status: "RENTED" })
        DB-->>Backend: Saved Contract & Updated Room
        Backend-->>MobileApp: 201 Created (Tạo hợp đồng thành công)
        MobileApp-->>Staff: Hiển thị màn hình chi tiết hợp đồng
    end
```

---

## 4. CLASS DIAGRAM (Sơ đồ lớp phân hệ Rental & Contract)

```mermaid
classDiagram
    class Room {
        +ObjectId _id
        +String roomNumber
        +Number basePrice
        +Number maxOccupants
        +String status
        +Date createdAt
        +Date updatedAt
    }

    class RentalRequest {
        +ObjectId _id
        +ObjectId userId
        +ObjectId roomId
        +String tenantName
        +String tenantPhone
        +Date requestDate
        +Date expectedMoveInDate
        +String note
        +String status
        +createRentalRequest()
        +getAllRentalRequests()
        +updateRentalRequestStatus()
    }

    class Contract {
        +ObjectId _id
        +ObjectId roomId
        +ObjectId tenantId
        +String tenantName
        +Date startDate
        +Date endDate
        +Number depositAmount
        +Number rentalPrice
        +String status
        +createContract()
        +getAllContracts()
        +getContractById()
        +extendContract(newEndDate)
        +terminateContract()
    }

    Room "1" <-- "0..*" RentalRequest : roomId (tham chiếu phòng)
    Room "1" <-- "0..*" Contract : roomId (tham chiếu phòng)
```

---

## 5. BẢNG CHI TIẾT TEST CASES ĐẢM NHIỆM

| Test Case ID | Tên ca kiểm thử | Điều kiện tiên quyết & Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC_RENTAL_01** | Gửi yêu cầu thuê phòng thành công | Phòng `P101` có trạng thái `AVAILABLE`. Dữ liệu: `roomId`, `tenantName: "Nguyễn Văn A"`, `tenantPhone: "0901234567"`. | 1. Chọn phòng P101.<br>2. Nhập họ tên, SĐT.<br>3. Bấm Gửi yêu cầu. | Server trả về Status `201 Created`, bản ghi lưu vào `rentalRequests` với `status: 'PENDING'`. |
| **TC_RENTAL_02** | Không cho thuê phòng đã được đặt / đang thuê | Phòng `P102` có trạng thái `RENTED` hoặc `MAINTENANCE`. | 1. Gửi request thuê phòng P102.<br>2. Gọi API `POST /api/rental-requests`. | Server trả về Status `400 Bad Request`, thông báo "Phòng hiện tại không khả dụng để thuê". |
| **TC_CTR_01** | Tạo hợp đồng hợp lệ | Phòng `P101` đang `AVAILABLE`. Nhập `startDate: 2026-11-01`, `endDate: 2027-05-01`, `depositAmount: 3000000`, `rentalPrice: 3000000`. | 1. Điền form tạo HĐ.<br>2. Bấm Xác nhận lập hợp đồng. | Hợp đồng tạo thành công (`201 Created`), trạng thái phòng P101 tự động chuyển sang `RENTED`. |
| **TC_CTR_02** | Không cho tạo hợp đồng trùng phòng | Phòng `P101` đã ở trạng thái `RENTED` hoặc đã có hợp đồng `ACTIVE`. | 1. Cố ý gửi payload lập HĐ mới cho P101.<br>2. Gọi `POST /api/contracts`. | Server báo lỗi `400 Bad Request`, "Phòng đang có hợp đồng hoạt động hoặc đã được thuê". |
| **TC_CTR_03** | Thanh lý hợp đồng và giải phóng phòng | Hợp đồng đang `ACTIVE`, phòng liên kết đang `RENTED`. | 1. Vào chi tiết hợp đồng.<br>2. Nhấn "Thanh lý hợp đồng".<br>3. Gọi `PUT /api/contracts/:id/terminate`. | Hợp đồng chuyển sang `TERMINATED`, trạng thái phòng tự động đổi về `AVAILABLE` để đón khách mới. |

