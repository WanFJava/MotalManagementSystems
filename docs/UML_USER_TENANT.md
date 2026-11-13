# TÀI LIỆU UML & ĐẶC TẢ PHÂN HỆ: USER AUTHENTICATION & TENANT MANAGEMENT
**Dự án:** Motel Management System (Hệ thống Quản lý Nhà trọ Thông minh)  
**Môn học:** Software Design (SWD392) - FPT University  
**Phân hệ phụ trách:** User Authentication & Tenant Management (Xác thực Người dùng & Quản lý Khách thuê)  

---

## 1. USE CASE DIAGRAM (Sơ đồ Use Case - Account & Tenant)

```mermaid
flowchart LR
    %% Actors
    Guest(["👤 Khách vãng lai (Guest)"])
    Tenant(["👤 Khách thuê (Tenant)"])
    Staff(["👔 Nhân viên (Staff)"])
    Manager(["👑 Chủ trọ / Quản lý (Manager)"])

    %% Inheritance of Actors
    Guest -->|Đăng ký / Đăng nhập| Tenant
    Manager -->|Kế thừa toàn quyền| Staff

    subgraph SystemBoundary ["Hệ thống Quản lý Nhà trọ (Motel Management System)"]
        %% UC01
        UC01_Reg(["UC01.1: Đăng ký tài khoản (Register)"])
        UC01_Log(["UC01.2: Đăng nhập hệ thống (Login - JWT)"])
        UC01_Prof(["UC01.3: Xem & Cập nhật Profile cá nhân"])

        %% UC06
        UC06_List(["UC06.1: Xem danh sách khách thuê trọ"])
        UC06_Detail(["UC06.2: Xem & Xác minh định danh CCCD"])
        UC06_Update(["UC06.3: Cập nhật thông tin & Đăng ký Tạm trú"])

        %% UC15
        UC15_List(["UC15.1: Xem danh sách nhân viên"])
        UC15_Create(["UC15.2: Thêm mới tài khoản nhân viên"])
        UC15_Lock(["UC15.3: Khóa / Mở khóa tài khoản (RBAC Status)"])

        UC01_Reg -.->|"<<include>>"| UC01_Log
        UC06_Detail -.->|"<<extend>>"| UC06_List
        UC06_Update -.->|"<<extend>>"| UC06_Detail
        UC15_Lock -.->|"<<extend>>"| UC15_List
    end

    %% Guest associations
    Guest --> UC01_Reg
    Guest --> UC01_Log

    %% Tenant associations
    Tenant --> UC01_Log
    Tenant --> UC01_Prof

    %% Staff associations
    Staff --> UC01_Log
    Staff --> UC01_Prof
    Staff --> UC06_List
    Staff --> UC06_Detail
    Staff --> UC06_Update

    %% Manager associations
    Manager --> UC15_List
    Manager --> UC15_Create
    Manager --> UC15_Lock
```

---

## 2. CLASS DIAGRAM (Sơ đồ Lớp - User & Các vai trò)

```mermaid
classDiagram
    %% Enumerations
    class UserRole {
        <<enumeration>>
        TENANT
        STAFF
        MANAGER
    }

    class TempResidenceStatus {
        <<enumeration>>
        NOT_REGISTERED
        PENDING
        REGISTERED
    }

    class Gender {
        <<enumeration>>
        MALE
        FEMALE
        OTHER
    }

    %% Entity Model
    class User {
        +ObjectId _id
        +String fullName
        +String phone
        +String email
        +String password
        +UserRole role
        +Boolean isActive
        +String identityNumber
        +Date identityIssuedDate
        +String identityIssuedPlace
        +String identityCardFront
        +String identityCardBack
        +Date dateOfBirth
        +Gender gender
        +String hometown
        +String address
        +String currentAddress
        +ObjectId currentRoom
        +TempResidenceStatus temporaryResidenceStatus
        +String avatar
        +Date createdAt
        +Date updatedAt
        +comparePassword(enteredPassword) Boolean
        +generateAuthToken() String
        +toJSON() Object
    }

    %% Service Layer
    class UserService {
        +registerUser(userData) Object
        +loginUser(credentials) Object
        +getUserById(id) User
        +getProfile(userId) User
        +updateProfile(userId, profileData) User
        +getAllUsers(filters) List~User~
        +getTenants(filters) List~User~
        +getStaffList(filters) List~User~
        +createStaff(staffData) User
        +updateTenantProfile(id, profileData) User
        +toggleUserStatus(id, isActive) Object
        +updateUser(id, updateData) User
        +deleteUser(id) Object
    }

    %% Controller Layer
    class UserController {
        +register(req, res)
        +login(req, res)
        +getMe(req, res)
        +getProfile(req, res)
        +updateProfile(req, res)
        +getAllUsers(req, res)
        +getTenants(req, res)
        +getStaff(req, res)
        +getUserById(req, res)
        +createStaff(req, res)
        +updateTenantProfile(req, res)
        +toggleUserStatus(req, res)
        +updateUser(req, res)
        +deleteUser(req, res)
    }

    %% Security Middleware
    class AuthMiddleware {
        +verifyToken(req, res, next)
        +optionalVerifyToken(req, res, next)
        +requireRole(...roles)(req, res, next)
    }

    %% Relationships
    User --> UserRole
    User --> TempResidenceStatus
    User --> Gender
    UserService --> User : "Thao tác CSDL"
    UserController --> UserService : "Ủy nhiệm nghiệp vụ"
    AuthMiddleware --> User : "Xác thực JWT & Role"
```

---

## 3. SEQUENCE DIAGRAMS (Sơ đồ tuần tự xử lý)

### 3.1. Đăng ký & Đăng nhập hệ thống (UC01 / TC_USER_01, TC_USER_02)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Người dùng (Web / Mobile)
    participant Route as Express Router (/api/auth)
    participant Ctrl as UserController
    participant Svc as UserService
    participant Model as User (Mongoose)
    participant DB as MongoDB (Collection users)

    %% Flow 1: Đăng ký
    Note over Client, DB: Luồng Đăng ký tài khoản (UC01 / TC_USER_01)
    Client->>Route: POST /api/auth/register {fullName, phone, email, password, role}
    Route->>Ctrl: register(req, res)
    Ctrl->>Svc: registerUser(userData)
    Svc->>Model: findOne({ phone }) & findOne({ email })
    Model->>DB: Truy vấn trùng lặp SĐT / Email
    DB-->>Model: Không trùng lặp
    Svc->>Model: new User(userData) (Pre-save Bcrypt Hash)
    Model->>DB: Lưu User mới vào collection
    DB-->>Model: Đã lưu thành công
    Svc->>Model: user.generateAuthToken()
    Model-->>Svc: JWT Token
    Svc-->>Ctrl: { user, token }
    Ctrl-->>Client: 201 Created { success: true, token, user }

    %% Flow 2: Đăng nhập
    Note over Client, DB: Luồng Đăng nhập hệ thống (UC01 / TC_USER_02)
    Client->>Route: POST /api/auth/login {identifier, password}
    Route->>Ctrl: login(req, res)
    Ctrl->>Svc: loginUser({identifier, password})
    Svc->>Model: findOne({ $or: [phone, email] })
    Model->>DB: Truy vấn user theo SĐT hoặc Email
    DB-->>Model: Trả về bản ghi User
    alt Tài khoản bị khóa (isActive === false)
        Svc-->>Ctrl: Throw Error ("Tài khoản đã bị khóa!")
        Ctrl-->>Client: 400 Bad Request
    else Mật khẩu không trùng khớp
        Svc->>Model: user.comparePassword(password)
        Model-->>Svc: false
        Svc-->>Ctrl: Throw Error ("Sai tài khoản hoặc mật khẩu!")
        Ctrl-->>Client: 401 Unauthorized
    else Đăng nhập thành công
        Svc->>Model: user.comparePassword(password)
        Model-->>Svc: true
        Svc->>Model: user.generateAuthToken()
        Model-->>Svc: JWT Token hợp lệ
        Svc-->>Ctrl: { user, token }
        Ctrl-->>Client: 200 OK { success: true, token, user }
    end
```

### 3.2. Quản lý Khách thuê & Cập nhật Hồ sơ CCCD (UC06 / TC_USER_03)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Nhân viên / Chủ trọ
    participant Route as Express Router (/api/users)
    participant Auth as AuthMiddleware
    participant Ctrl as UserController
    participant Svc as UserService
    participant DB as MongoDB

    Admin->>Route: PUT /api/users/:id/tenant-profile {identityNumber, hometown, currentAddress, temporaryResidenceStatus}
    Route->>Auth: verifyToken / requireRole('STAFF', 'MANAGER')
    Auth-->>Route: Cho phép tiếp tục (Next)
    Route->>Ctrl: updateTenantProfile(req, res)
    Ctrl->>Svc: updateTenantProfile(id, profileData)
    Svc->>DB: Kiểm tra trùng số CCCD với khách khác
    DB-->>Svc: Hợp lệ (không trùng)
    Svc->>DB: Cập nhật thông tin định danh & trạng thái tạm trú
    DB-->>Svc: Bản ghi đã cập nhật
    Svc-->>Ctrl: User Profile mới
    Ctrl-->>Admin: 200 OK { success: true, message: "Cập nhật hồ sơ CCCD thành công!" }
```

---

## 4. BẢNG ĐẶC TẢ CƠ SỞ DỮ LIỆU (Database Schema: `users`)

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key, Auto Generated | Mã định danh duy nhất của người dùng |
| `fullName` | String | Required, Trim | Họ và tên đầy đủ |
| `phone` | String | Required, Unique, Regex `^[0-9]{9,11}$` | Số điện thoại đăng nhập & liên lạc |
| `email` | String | Required, Unique, Lowercase | Email cá nhân nhận thông báo |
| `password` | String | Required, Min length: 6, Bcrypt | Mật khẩu tài khoản (đã được băm an toàn) |
| `role` | String | Enum: `['TENANT', 'STAFF', 'MANAGER']` | Phân quyền vai trò trong hệ thống |
| `isActive` | Boolean | Default: `true` | Trạng thái kích hoạt (false = bị khóa) |
| `identityNumber` | String | Sparse, Unique, Regex `^[0-9]{9,12}$` | Số CCCD / Hộ chiếu định danh |
| `identityIssuedDate` | Date | Optional | Ngày cấp CCCD |
| `identityIssuedPlace`| String | Default: 'Cục Cảnh sát QLHC về TTXH' | Nơi cấp CCCD |
| `identityCardFront` | String | URL String | Đường dẫn ảnh mặt trước thẻ CCCD |
| `identityCardBack`  | String | URL String | Đường dẫn ảnh mặt sau thẻ CCCD |
| `address` | String | Trim, Default: '' | Địa chỉ thường trú của khách |
| `currentAddress` | String | Trim, Default: '' | Nơi ở hiện tại trước khi thuê |
| `hometown` | String | Trim, Default: '' | Quê quán nguyên quán |
| `gender` | String | Enum: `['MALE', 'FEMALE', 'OTHER']` | Giới tính |
| `temporaryResidenceStatus` | String | Enum: `['NOT_REGISTERED', 'PENDING', 'REGISTERED']` | Trạng thái đăng ký tạm trú với Công an |
| `currentRoom` | ObjectId | Ref: `'Room'`, Default: `null` | Phòng đang thuê hiện tại (nếu có) |
| `avatar` | String | URL String | Đường dẫn ảnh đại diện |
| `createdAt` | Date | Timestamps | Ngày tạo tài khoản |
| `updatedAt` | Date | Timestamps | Ngày cập nhật gần nhất |

---

## 5. Ý NGHĨA NGHIỆP VỤ THỰC TẾ CỦA PROFILESCREEN

Khách thuê bắt buộc phải có màn hình **`ProfileScreen`** để giải quyết 3 bài toán nghiệp vụ cốt lõi:

1. **Hoàn thiện hồ sơ định danh pháp lý:**
   - Cập nhật **Số CCCD (12 chữ số)**, ngày cấp, nơi cấp.
   - Cập nhật **Quê quán / Địa chỉ thường trú**.
   - Tải lên ảnh chụp 2 mặt của thẻ CCCD để chủ trọ khai báo tạm trú với Công an khu vực theo Luật Cư trú.
2. **Quản lý thông tin liên lạc & tài khoản:**
   - Cập nhật **Số điện thoại** hoặc **Email** để nhận thông báo tiền phòng, hóa đơn hàng tháng.
   - **Đổi mật khẩu** tài khoản khi cần bảo mật.
3. **Phục vụ tự động điền (Auto-fill):**
   - Khi khách đã cập nhật đầy đủ CCCD trong Profile, khi sang phân hệ của Quang để bấm *"Gửi yêu cầu thuê phòng"*, hệ thống sẽ tự động lấy thông tin từ Profile sang, khách không cần gõ lại từ đầu.

---

## 6. MA TRẬN TEST CASES (Test Matrix)

| Mã Test Case | Tên Kiểm Thử | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC_USER_01** | Đăng ký tài khoản hợp lệ | Họ tên, SĐT, Email, Password hợp lệ | Tạo thành công, mật khẩu Bcrypt băm an toàn, sinh JWT Token | **PASS ✅** |
| **TC_USER_02** | Đăng nhập sai & đúng mật khẩu | Sai password $\rightarrow$ Đúng password | Báo lỗi 401 khi sai mật khẩu; Trả về token khi đúng mật khẩu | **PASS ✅** |
| **TC_USER_03** | Cập nhật hồ sơ cá nhân & CCCD | CCCD 12 số, địa chỉ, quê quán | Cập nhật thành công; Chặn báo lỗi khi gán trùng số CCCD người khác | **PASS ✅** |
| **TC_USER_04** | Kiểm tra phân quyền & Khóa tài khoản | Role `TENANT` gọi quyền Manager; Khóa `isActive = false` | Chặn 403 Forbidden đúng quyền; Chặn đăng nhập khi tài khoản bị khóa | **PASS ✅** |
