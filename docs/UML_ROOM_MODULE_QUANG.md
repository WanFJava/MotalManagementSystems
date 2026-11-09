# TÀI LIỆU THIẾT KẾ UML CHI TIẾT - PHÂN HỆ QUẢN LÝ PHÒNG (QUANG - LEADER)
**Môn học:** Software Design (SWD392) - FPT University  
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Tác giả:** Nguyễn Ngọc Quang (Thành viên 1 - Trưởng nhóm)  
**Phân hệ đảm nhiệm:** Room Management & Room Search (`Room`, `RentalRequest`)

---

## I. TỔNG QUAN DANH SÁCH SƠ ĐỒ ĐÃ TẠO

Toàn bộ các sơ đồ được xây dựng theo chuẩn **BCE (Boundary - Controller - Entity)** nghiêm ngặt, bám sát 100% mã nguồn thực tế của Backend (`backend/controllers/roomController.js`, `roomService.js`) và Frontend (`ManageRoomScreen.jsx`, `RoomSearchScreen.jsx`, `RoomDetailScreen.jsx`).

Tất cả các file vẽ sẵn chuẩn định dạng `.drawio` (tương thích 100% với bản mẫu `UC-M09_Update_Room_Info_SequenceDiagram.drawio` mà giáo viên đã chấm ổn) đã được lưu sẵn tại:
1. **Thư mục Downloads của máy:** `C:\Users\nguye\Downloads\`
2. **Thư mục docs dự án:** `E:\02_Projects_BaiTap\ReactJS_FER202\LuyenReactJS\MotalManagementSystems\docs\diagrams\`

Danh mục các file:
- 📊 **Class Diagram:** `ClassDiagram_Room_Module.drawio`
- 🔁 **Sequence Diagram UC-M04.1 (Thêm phòng):** `UC-M04_1_Create_Room_SequenceDiagram.drawio`
- 🔁 **Sequence Diagram UC-M04.2 (Sửa phòng):** `UC-M04_2_Update_Room_SequenceDiagram.drawio`
- 🔁 **Sequence Diagram UC-M04.3 (Xóa phòng):** `UC-M04_3_Delete_Room_SequenceDiagram.drawio`
- 🔁 **Sequence Diagram UC-M02 (Tìm kiếm & Lọc phòng):** `UC-M02_Search_Room_SequenceDiagram.drawio`
- 🔁 **Sequence Diagram UC-M03 (Chi tiết & Yêu cầu thuê phòng):** `UC-M03_Request_Rental_SequenceDiagram.drawio`

---

## II. SƠ ĐỒ LỚP (CLASS DIAGRAM) - PHÂN HỆ QUẢN LÝ PHÒNG

### 1. Biểu đồ Mermaid Class Diagram
```mermaid
classDiagram
    direction LR

    class RoomInventoryPage {
        <<boundary>>
        - rooms: Room[]
        - selectedRoom: Room
        - filterStatus: String
        - isModalOpen: Boolean
        + componentDidMount() void
        + loadRooms() void
        + handleCreateRoom(data: CreateRoomDTO) void
        + handleUpdateRoom(id: String, data: UpdateRoomDTO) void
        + handleDeleteRoom(id: String) void
        + render() JSX.Element
    }

    class RoomSearchPage {
        <<boundary>>
        - searchResults: Room[]
        - filterCriteria: RoomFilterDTO
        - loading: Boolean
        + handleSearch() void
        + handleFilterChange(field: String, val: Any) void
        + renderGridCards() JSX.Element
    }

    class RoomDetailPage {
        <<boundary>>
        - room: Room
        - requestModalOpen: Boolean
        + loadRoomDetails(id: String) void
        + submitRentalRequest(req: RentalRequestDTO) void
    }

    class RoomController {
        <<controller>>
        + getAllRooms(req: Request, res: Response) Promise~void~
        + searchRooms(req: Request, res: Response) Promise~void~
        + getRoomById(req: Request, res: Response) Promise~void~
        + createRoom(req: Request, res: Response) Promise~void~
        + updateRoom(req: Request, res: Response) Promise~void~
        + deleteRoom(req: Request, res: Response) Promise~void~
        + createRentalRequest(req: Request, res: Response) Promise~void~
    }

    class RoomService {
        <<service>>
        + fetchAllRooms() Promise~Room[]~
        + searchByCriteria(filter: RoomFilterDTO) Promise~Room[]~
        + findRoomById(id: String) Promise~Room~
        + createNewRoom(dto: CreateRoomDTO) Promise~Room~
        + updateRoomById(id: String, dto: UpdateRoomDTO) Promise~Room~
        + removeRoom(id: String) Promise~Boolean~
        + validateRoomNumberUnique(num: String) Promise~Boolean~
    }

    class Room {
        <<entity>>
        + _id: ObjectId
        + roomNumber: String
        + basePrice: Number
        + area: Number
        + maxOccupants: Number
        + amenities: String[]
        + status: RoomStatus
        + description: String
        + images: String[]
        + createdAt: Date
        + updatedAt: Date
        + isAvailable() Boolean
        + canBeDeleted() Boolean
    }

    class RentalRequest {
        <<entity>>
        + _id: ObjectId
        + roomId: ObjectId
        + tenantName: String
        + tenantPhone: String
        + tenantEmail: String
        + moveInDate: Date
        + note: String
        + status: RequestStatus
        + createdAt: Date
        + approve() void
        + reject(reason: String) void
    }

    class RoomStatus {
        <<enumeration>>
        AVAILABLE
        RENTED
        MAINTENANCE
    }

    RoomInventoryPage ..> RoomController : HTTP REST
    RoomSearchPage ..> RoomController : HTTP REST
    RoomDetailPage ..> RoomController : HTTP REST
    RoomController ..> RoomService : delegates
    RoomService ..> Room : manages
    RoomService ..> RentalRequest : creates
    Room "1" -- "0..*" RentalRequest : receives
    Room ..> RoomStatus : has
```

---

## III. CHI TIẾT CÁC SEQUENCE DIAGRAM (TUẦN TỰ THEO TỪNG USE CASE)

### 1. UC-M04.1: Tạo Phòng Trọ Mới (Create Room)
- **Actor:** `Manager` / `Staff`
- **Lifelines:** `Manager` $\rightarrow$ `«boundary» RoomInventoryPage` $\rightarrow$ `«controller» RoomController` $\rightarrow$ `«entity» Room` $\rightarrow$ `«database» MongoDB`

```mermaid
sequenceDiagram
    autonumber
    actor M as Manager
    participant UI as «boundary»<br>RoomInventoryPage
    participant C as «controller»<br>RoomController
    participant R as «entity»<br>Room
    participant DB as «database»<br>MongoDB

    M->>UI: Click "Thêm phòng mới"
    UI-->>M: Hiển thị Modal Form nhập phòng mới
    M->>UI: Điền (roomNumber, basePrice, area, amenities) & Click "Lưu"
    UI->>C: POST /api/rooms (body: roomData)
    activate C
    C->>C: authenticate & validate input (price > 0)
    alt Không có quyền hoặc chưa đăng nhập
        C-->>UI: 401 Unauthorized / 403 Forbidden
        UI-->>M: Cảnh báo lỗi quyền truy cập
    else Dữ liệu không hợp lệ (giá <= 0, thiếu số phòng)
        C-->>UI: 400 Bad Request (lỗi validation)
        UI-->>M: Hiển thị lỗi form
    else Dữ liệu hợp lệ
        C->>R: findOne({ roomNumber: roomNumber.trim() })
        activate R
        R->>DB: db.rooms.findOne({ roomNumber })
        activate DB
        alt Số phòng đã tồn tại
            DB-->>R: existing room doc
            R-->>C: room found
            C-->>UI: 400 Bad Request ("Số phòng đã tồn tại")
            UI-->>M: Thông báo: "Số phòng đã tồn tại, vui lòng chọn số khác"
        else Số phòng hợp lệ (chưa bị trùng)
            DB-->>R: null
            deactivate DB
            C->>R: create(roomData)
            R->>DB: db.rooms.insertOne(roomDoc)
            activate DB
            DB-->>R: inserted document with _id
            deactivate DB
            R-->>C: new Room instance
            deactivate R
            C-->>UI: 201 Created (success: true, data: newRoom)
            UI-->>M: Đóng modal, hiển thị Toast "Tạo phòng thành công!", reload danh sách
        end
    end
    deactivate C
```

---

### 2. UC-M04.2: Cập Nhật Thông Tin Phòng Trọ (Update Room)
*(Đồng bộ 100% với bản mẫu `UC-M09_Update_Room_Info_SequenceDiagram.drawio` đã được giáo viên duyệt)*:
- **Luồng gồm 2 pha:**
  1. Pha 1: `GET /api/rooms/:id` để nạp dữ liệu hiện tại lên Form sửa.
  2. Pha 2: `PATCH /api/rooms/:id` kiểm tra quyền `MANAGE_INVENTORY`, validate dữ liệu, kiểm tra trùng số phòng và optimistic locking trước khi cập nhật CSDL.

```mermaid
sequenceDiagram
    autonumber
    actor M as Manager
    participant UI as «boundary»<br>RoomInventoryPage
    participant C as «controller»<br>RoomController
    participant R as «entity»<br>Room
    participant DB as «database»<br>MongoDB

    M->>UI: Chọn phòng cần sửa
    UI->>C: GET /api/rooms/:id
    C->>R: findById(id)
    R->>DB: query room by _id
    DB-->>R: room document
    R-->>C: room
    C-->>UI: 200 OK (room, version)
    UI-->>M: Hiển thị form chỉnh sửa với giá trị hiện tại

    M->>UI: Thay đổi thông tin (roomNumber, floor, notes) & Lưu
    UI->>C: PATCH /api/rooms/:id
    activate C
    C->>C: authenticate & validate input
    alt Không có quyền (401 / 403)
        C-->>UI: 401 Unauthorized / 403 Forbidden
        UI-->>M: Thông báo lỗi quyền
    else Dữ liệu không hợp lệ (400)
        C-->>UI: 400 Bad Request
        UI-->>M: Hiển thị field errors
    else Dữ liệu hợp lệ
        C->>R: findOneAndUpdate(_id + version, $set, $inc version)
        activate R
        R->>DB: conditional update
        activate DB
        alt Trùng số phòng (Unique index)
            DB-->>R: duplicate key error
            R-->>C: error
            C-->>UI: 409 Conflict
            UI-->>M: "Room number already exists"
        else Xung đột phiên bản (Concurrent modification)
            DB-->>R: no document
            R-->>C: null
            C-->>UI: 409 ROOM_CHANGED
            UI-->>M: "Room changed meanwhile, refresh and retry"
        else Cập nhật thành công
            DB-->>R: updated document
            deactivate DB
            R-->>C: updated room
            deactivate R
            C-->>UI: 200 OK (room)
            UI-->>M: Hiển thị thành công, cập nhật giao diện
        end
    end
    deactivate C
```

---

### 3. UC-M04.3: Xóa Phòng Trọ (Delete Room)
- **Ràng buộc nghiệp vụ quan trọng:** Chặn xóa nếu phòng đang có khách ở (`RENTED`) hoặc đang gắn với Hợp đồng có hiệu lực (`ACTIVE`).

```mermaid
sequenceDiagram
    autonumber
    actor M as Manager
    participant UI as «boundary»<br>RoomInventoryPage
    participant C as «controller»<br>RoomController
    participant R as «entity»<br>Room
    participant DB as «database»<br>MongoDB

    M->>UI: Chọn phòng và nhấn nút "Xóa"
    UI-->>M: Hiển thị hộp thoại xác nhận xóa phòng
    M->>UI: Xác nhận "Đồng ý xóa"
    UI->>C: DELETE /api/rooms/:id
    activate C
    C->>C: authenticate, requireRole('MANAGER')
    C->>R: findById(id)
    R->>DB: db.rooms.findOne({ _id: id })
    DB-->>R: room document
    R-->>C: room

    alt Phòng không tồn tại
        C-->>UI: 404 Not Found ("Phòng không tồn tại")
        UI-->>M: Báo lỗi "Phòng không tồn tại"
    else Phòng đang có khách thuê (room.status === 'RENTED')
        C-->>UI: 400 Bad Request ("Không thể xóa phòng đang có khách thuê")
        UI-->>M: Cảnh báo: "Phòng đang có người thuê, vui lòng thanh lý hợp đồng trước!"
    else Phòng trống (AVAILABLE / MAINTENANCE)
        C->>DB: db.contracts.findOne({ room: id, status: 'ACTIVE' })
        activate DB
        alt Tồn tại hợp đồng ACTIVE liên kết
            DB-->>C: activeContract doc
            C-->>UI: 400 Bad Request ("Phòng đang có hợp đồng hiệu lực")
            UI-->>M: Cảnh báo ràng buộc hợp đồng
        else An toàn để xóa
            DB-->>C: null
            deactivate DB
            C->>R: deleteOne({ _id: id })
            activate R
            R->>DB: db.rooms.deleteOne({ _id: id })
            activate DB
            DB-->>R: { acknowledged: true, deletedCount: 1 }
            deactivate DB
            R-->>C: delete result
            deactivate R
            C-->>UI: 200 OK (success: true, message: "Xóa phòng thành công")
            UI-->>M: Hiển thị Toast thành công, xóa dòng khỏi bảng
        end
    end
    deactivate C
```

---

### 4. UC-M02: Tìm Kiếm & Lọc Phòng (Search Room)
- **Actor:** `Tenant` / `Guest`
- **Chức năng:** Tìm kiếm theo từ khóa số phòng/mô tả kết hợp bộ lọc khoảng giá, diện tích, trạng thái, tiện ích.

```mermaid
sequenceDiagram
    autonumber
    actor T as Tenant / Guest
    participant UI as «boundary»<br>RoomSearchPage
    participant C as «controller»<br>RoomController
    participant R as «entity»<br>Room
    participant DB as «database»<br>MongoDB

    T->>UI: Chọn tiêu chí lọc (keyword, status, minPrice, maxPrice, area, amenities)
    T->>UI: Nhấn "Tìm kiếm phòng"
    UI->>C: GET /api/rooms/search?keyword=...&minPrice=...&maxPrice=...
    activate C
    C->>C: build dynamic query object { status, basePrice: { $gte, $lte }, ... }
    C->>R: find(queryCriteria).sort({ createdAt: -1 })
    activate R
    R->>DB: db.rooms.find(queryCriteria)
    activate DB
    DB-->>R: cursor of matching room documents
    deactivate DB
    R-->>C: rooms array
    deactivate R
    alt Không tìm thấy phòng thỏa mãn
        C-->>UI: 200 OK (success: true, data: [])
        UI-->>T: Hiển thị giao diện rỗng: "Không có phòng nào thỏa mãn tiêu chí tìm kiếm"
    else Có kết quả
        C-->>UI: 200 OK (success: true, total: rooms.length, data: rooms)
        UI-->>T: Render danh sách dạng lưới Card Grid (ảnh, giá thuê, diện tích, tag tiện ích)
    end
    deactivate C
```

---

### 5. UC-M03: Gửi Yêu Cầu Thuê Phòng (Request Rental)
- **Actor:** `Tenant`
- **Chức năng:** Khách xem chi tiết phòng và gửi form yêu cầu giữ chỗ/đặt phòng.

```mermaid
sequenceDiagram
    autonumber
    actor T as Tenant
    participant UI as «boundary»<br>RoomDetailPage
    participant C as «controller»<br>RoomController
    participant REQ as «entity»<br>RentalRequest
    participant DB as «database»<br>MongoDB

    T->>UI: Nhấn "Gửi yêu cầu giữ phòng"
    UI-->>T: Mở Modal nhập Họ tên, SĐT, Email, Ngày dọn vào, Ghi chú
    T->>UI: Điền thông tin và nhấn "Xác nhận gửi yêu cầu"
    UI->>C: POST /api/rooms/:id/rental-request (body: tenantRequestData)
    activate C
    C->>C: validate SĐT, họ tên, ngày dọn vào
    alt Thông tin thiếu hoặc sai định dạng
        C-->>UI: 400 Bad Request ("Vui lòng điền đủ họ tên, SĐT và ngày dọn vào")
        UI-->>T: Hiển thị lỗi ngay trên form
    else Thông tin hợp lệ
        C->>DB: db.rooms.findById(id)
        activate DB
        DB-->>C: room doc
        deactivate DB
        alt Phòng đang bảo trì hoặc đã thuê
            C-->>UI: 400 Bad Request ("Phòng không sẵn sàng để nhận yêu cầu")
            UI-->>T: Cảnh báo phòng không khả dụng
        else Phòng đang trống (AVAILABLE)
            C->>REQ: create({ roomId, tenantInfo, status: 'PENDING' })
            activate REQ
            REQ->>DB: db.rentalRequests.insertOne(requestDoc)
            activate DB
            DB-->>REQ: inserted document
            deactivate DB
            REQ-->>C: rentalRequest instance
            deactivate REQ
            C-->>UI: 201 Created (success: true, message: "Gửi yêu cầu thành công", data)
            UI-->>T: Đóng modal, hiển thị popup mã xác nhận và hướng dẫn chờ duyệt
        end
    end
    deactivate C
```

---

## IV. CÁCH SỬ DỤNG TRÊN VISUAL PARADIGM & NỘP BÁO CÁO

### Cách 1: Mở và chỉnh sửa trực tiếp (Khuyên dùng - Nhanh nhất)
1. Mở trình duyệt truy cập: **https://app.diagrams.net** (hoặc mở ứng dụng Draw.io trên máy/VS Code).
2. Chọn **Open Existing Diagram** $\rightarrow$ Trỏ tới file trong thư mục `C:\Users\nguye\Downloads\`:
   - `ClassDiagram_Room_Module.drawio`
   - `UC-M04_1_Create_Room_SequenceDiagram.drawio`
   - `UC-M04_2_Update_Room_SequenceDiagram.drawio`
   - `UC-M04_3_Delete_Room_SequenceDiagram.drawio`
   - `UC-M02_Search_Room_SequenceDiagram.drawio`
   - `UC-M03_Request_Rental_SequenceDiagram.drawio`
3. Nhấn **File** $\rightarrow$ **Export as** $\rightarrow$ **PNG** (hoặc PDF) để chèn ngay vào báo cáo Word hoặc Slide thuyết trình.

### Cách 2: Sử dụng trong Visual Paradigm (Đang mở trên máy bạn)
1. Trong Visual Paradigm, tạo Diagram mới:
   - Đối với Class Diagram: Chọn **Diagram** $\rightarrow$ **New** $\rightarrow$ **Class Diagram**.
   - Đối với Sequence Diagram: Chọn **Diagram** $\rightarrow$ **New** $\rightarrow$ **Sequence Diagram**.
2. Nhập các Lifeline theo đúng cấu trúc BCE đã chuẩn hóa ở trên:
   - Lifeline 1: `Manager` (Actor)
   - Lifeline 2: `RoomInventoryPage` (Stereotype: `«boundary»`)
   - Lifeline 3: `RoomController` (Stereotype: `«controller»` hoặc `«control»`)
   - Lifeline 4: `Room` (Stereotype: `«entity»`)
   - Lifeline 5: `MongoDB` (Stereotype: `«database»`)
3. Vẽ các Message và khối `alt` theo đúng số thứ tự và nội dung đã liệt kê trong bảng Mermaid/Sequence trên.
