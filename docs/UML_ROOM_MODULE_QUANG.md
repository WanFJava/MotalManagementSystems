# UML DESIGN SPECIFICATION - ROOM MANAGEMENT MODULE (QUANG - LEADER)
**Course:** Software Design (SWD392) - FPT University  
**Project:** Motel Management System  
**Author:** Nguyen Ngoc Quang (Member 1 - Team Leader)  
**Assigned Module:** Room Management & Room Search (`Room`, `RentalRequest`)

---

## I. DIAGRAM FILES OVERVIEW

All diagrams are designed strictly following the **BCE (Boundary - Controller - Entity)** software engineering pattern, fully synchronized with the project's actual Backend (`backend/controllers/roomController.js`, `roomService.js`) and Frontend (`ManageRoomScreen.jsx`, `RoomSearchScreen.jsx`, `RoomDetailScreen.jsx`).

All `.drawio` files (100% in professional English, adhering to the teacher's approved standard `UC-M09_Update_Room_Info_SequenceDiagram.drawio`) are located at:
1. **Local Downloads folder:** `C:\Users\nguye\Downloads\`
2. **Project Docs folder:** `E:\02_Projects_BaiTap\ReactJS_FER202\LuyenReactJS\MotalManagementSystems\docs\diagrams\`

File list:
- 📊 **Class Diagram:** `ClassDiagram_Room_Module.drawio`
- 🔁 **Sequence Diagram UC-M04.1 (Create Room):** `UC-M04_1_Create_Room_SequenceDiagram.drawio`
- 🔁 **Sequence Diagram UC-M04.2 (Update Room):** `UC-M04_2_Update_Room_SequenceDiagram.drawio`
- 🔁 **Sequence Diagram UC-M04.3 (Delete Room):** `UC-M04_3_Delete_Room_SequenceDiagram.drawio`
- 🔁 **Sequence Diagram UC-M02 (Search & Filter Room):** `UC-M02_Search_Room_SequenceDiagram.drawio`
- 🔁 **Sequence Diagram UC-M03 (Request Rental / Hold Room):** `UC-M03_Request_Rental_SequenceDiagram.drawio`

---

## II. CLASS DIAGRAM - ROOM MODULE

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

    class RequestStatus {
        <<enumeration>>
        PENDING
        APPROVED
        REJECTED
    }

    RoomInventoryPage ..> RoomController : HTTP REST
    RoomSearchPage ..> RoomController : HTTP REST
    RoomDetailPage ..> RoomController : HTTP REST
    RoomController ..> RoomService : delegates
    RoomService ..> Room : manages
    RoomService ..> RentalRequest : creates
    Room "1" -- "0..*" RentalRequest : receives
    Room ..> RoomStatus : has
    RentalRequest ..> RequestStatus : has
```

---

## III. SEQUENCE DIAGRAMS (100% ENGLISH)

### 1. UC-M04.1: Create Room
- **Actor:** `Manager`
- **Lifelines:** `Manager` $\rightarrow$ `«boundary» RoomInventoryPage` $\rightarrow$ `«controller» RoomController` $\rightarrow$ `«entity» Room` $\rightarrow$ `«database» MongoDB`

```mermaid
sequenceDiagram
    autonumber
    actor M as Manager
    participant UI as «boundary»<br>RoomInventoryPage
    participant C as «controller»<br>RoomController
    participant R as «entity»<br>Room
    participant DB as «database»<br>MongoDB

    M->>UI: click "Add New Room"
    UI-->>M: render empty room creation modal form
    M->>UI: fill room details (roomNumber, basePrice, area, amenities) & submit
    UI->>C: POST /api/rooms (body: roomData)
    activate C
    C->>C: authenticate & validate input (basePrice > 0, roomNumber)
    alt not signed in or missing permission
        C-->>UI: 401 Unauthorized / 403 Forbidden
        UI-->>M: show access error notification
    else invalid input (basePrice <= 0 or missing roomNumber)
        C-->>UI: 400 Bad Request (validation errors)
        UI-->>M: show form errors: "Base price must be greater than 0"
    else valid request
        C->>R: findOne({ roomNumber: roomNumber.trim() })
        activate R
        R->>DB: db.rooms.findOne({ roomNumber })
        activate DB
        alt roomNumber already exists (unique index)
            DB-->>R: existing room document
            R-->>C: existing room instance
            C-->>UI: 400 Bad Request ("Room number already exists")
            UI-->>M: show error toast: "Room number already exists, please choose another"
        else roomNumber is unique
            DB-->>R: null (not found)
            deactivate DB
            C->>R: create(roomData)
            R->>DB: db.rooms.insertOne(roomDoc)
            activate DB
            DB-->>R: inserted document with _id
            deactivate DB
            R-->>C: new Room instance
            deactivate R
            C-->>UI: 201 Created (success: true, data: newRoom)
            UI-->>M: close modal, show success toast "Room created successfully!", reload list
        end
    end
    deactivate C
```

---

### 2. UC-M04.2: Update Room Information
*(Matches the teacher's approved sample `UC-M09_Update_Room_Info_SequenceDiagram.drawio`)*:

```mermaid
sequenceDiagram
    autonumber
    actor M as Manager
    participant UI as «boundary»<br>RoomInventoryPage
    participant C as «boundary»<br>RoomController
    participant R as «entity»<br>Room
    participant DB as «database»<br>MongoDB

    M->>UI: select a room to edit
    UI->>C: GET /api/rooms/:id
    C->>R: findById(id)
    R->>DB: query room by _id
    DB-->>R: room document
    R-->>C: room
    C-->>UI: 200 OK (room, version)
    UI-->>M: show form with current values

    M->>UI: edit roomNumber, floor, notes and save
    UI->>C: PATCH /api/rooms/:id (roomNumber, floor, notes, version)
    activate C
    C->>C: authenticate, requirePermission(MANAGE_INVENTORY), validate input
    alt not signed in or missing permission
        C-->>UI: 401 Unauthorized / 403 Forbidden
        UI-->>M: show access error
    else invalid input
        C-->>UI: 400 Bad Request
        UI-->>M: show field errors
    else valid request
        C->>R: findOneAndUpdate(_id + version, $set fields, $inc version)
        activate R
        R->>DB: conditional update
        activate DB
        alt roomNumber already used (unique index)
            DB-->>R: duplicate key error
            R-->>C: error
            C-->>UI: 409 Conflict
            UI-->>M: "Room number already exists"
        else _id + version not matched
            DB-->>R: no document
            R-->>C: null
            C-->>UI: 409 ROOM_CHANGED
            UI-->>M: "Room changed meanwhile, refresh and retry"
        else updated
            DB-->>R: updated document
            deactivate DB
            R-->>C: updated room
            deactivate R
            C-->>UI: 200 OK (room)
            UI-->>M: show success, refresh room details
        end
    end
    deactivate C
```

---

### 3. UC-M04.3: Delete Room
- **Key Business Constraint:** Prevents deletion if the room is currently occupied (`RENTED`) or associated with an active contract (`ACTIVE`).

```mermaid
sequenceDiagram
    autonumber
    actor M as Manager
    participant UI as «boundary»<br>RoomInventoryPage
    participant C as «controller»<br>RoomController
    participant R as «entity»<br>Room
    participant DB as «database»<br>MongoDB

    M->>UI: select room and click "Delete Room"
    UI-->>M: show delete confirmation modal dialog
    M->>UI: confirm "Yes, Delete"
    UI->>C: DELETE /api/rooms/:id
    activate C
    C->>C: authenticate, requireRole('MANAGER')
    C->>R: findById(id)
    R->>DB: db.rooms.findOne({ _id: id })
    DB-->>R: room document
    R-->>C: room instance

    alt room does not exist
        C-->>UI: 404 Not Found ("Room not found")
        UI-->>M: show error message: "Room not found"
    else room.status === 'RENTED' (room currently rented)
        C-->>UI: 400 Bad Request ("Cannot delete occupied room")
        UI-->>M: show warning: "Cannot delete room currently occupied by tenant!"
    else room.status !== 'RENTED' (check active lease contracts)
        C->>DB: db.contracts.findOne({ room: id, status: 'ACTIVE' })
        activate DB
        alt activeContract exists
            DB-->>C: activeContract document
            C-->>UI: 400 Bad Request ("Active contract exists for this room")
            UI-->>M: show error toast: "Please terminate the active lease contract before deleting"
        else valid: no active contracts found
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
            C-->>UI: 200 OK (success: true, message: "Room deleted successfully")
            UI-->>M: show success toast notification, remove room row from table
        end
    end
    deactivate C
```

---

### 4. UC-M02: Search & Filter Rooms
- **Actor:** `Tenant` / `Guest`

```mermaid
sequenceDiagram
    autonumber
    actor T as Tenant / Guest
    participant UI as «boundary»<br>RoomSearchPage
    participant C as «controller»<br>RoomController
    participant R as «entity»<br>Room
    participant DB as «database»<br>MongoDB

    T->>UI: select filter criteria (keyword, status, minPrice, maxPrice, area, amenities)
    T->>UI: click "Search Rooms"
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
    alt rooms.length === 0 (no rooms match criteria)
        C-->>UI: 200 OK (success: true, data: [])
        UI-->>T: show empty state: "No rooms match your search criteria"
    else rooms.length > 0 (matching rooms found)
        C-->>UI: 200 OK (success: true, total: rooms.length, data: rooms)
        UI-->>T: render room cards in grid layout (photos, price, area, amenity tags)
    end
    deactivate C
```

---

### 5. UC-M03: Request Rental / Hold Room
- **Actor:** `Tenant`

```mermaid
sequenceDiagram
    autonumber
    actor T as Tenant
    participant UI as «boundary»<br>RoomDetailPage
    participant C as «controller»<br>RoomController
    participant REQ as «entity»<br>RentalRequest
    participant DB as «database»<br>MongoDB

    T->>UI: click "Request Rental / Hold Room"
    UI-->>T: render modal form (fullName, phone, email, moveInDate, note)
    T->>UI: fill form details and click "Submit Request"
    UI->>C: POST /api/rooms/:id/rental-request (body: tenantRequestData)
    activate C
    C->>C: validate phone, fullName, moveInDate
    alt invalid input: invalid phone format or missing moveInDate
        C-->>UI: 400 Bad Request ("Please provide full name, valid phone and move-in date")
        UI-->>T: show validation error message on form
    else valid input
        C->>DB: db.rooms.findById(id)
        activate DB
        DB-->>C: room document
        deactivate DB
        alt room.status === 'MAINTENANCE' or 'RENTED'
            C-->>UI: 400 Bad Request ("Room is currently not available for rental requests")
            UI-->>T: show error toast: "Room is currently not available, please choose another"
        else room.status === 'AVAILABLE'
            C->>REQ: create({ roomId, tenantInfo, status: 'PENDING' })
            activate REQ
            REQ->>DB: db.rentalRequests.insertOne(requestDoc)
            activate DB
            DB-->>REQ: inserted rentalRequest doc
            deactivate DB
            REQ-->>C: rentalRequest instance
            deactivate REQ
            C-->>UI: 201 Created (success: true, message: "Request submitted successfully", data)
            UI-->>T: close modal, show confirmation popup with request ID and instructions
        end
    end
    deactivate C
```
