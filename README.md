# Kế Hoạch & Cấu Trúc Dự Án Quản Lý Chung Cư
Tài liệu này mô tả luồng phát triển và cấu trúc thư mục chi tiết cho dự án Quản lý chung cư (MERN Stack), được tùy biến dựa trên danh sách Use Case (UC001 - UC014) và mô hình phân rã chức năng đã cung cấp.
## 1. Luồng Dự Án (Project Flow)
Để đảm bảo các chức năng trong ảnh (Quản lý khoản thu, hộ khẩu, đợt thu...) hoạt động trơn tru, dự án nên được triển khai theo 5 giai đoạn:
### Giai đoạn 1: Khởi tạo & Thiết kế CSDL (Database Design)
Đây là bước quan trọng nhất để map các Use Case vào dữ liệu.
#### Thiết kế Schema:
#### Thiết kế Schema:
1. User: Dành cho admin/cán bộ quản lý đăng nhập (UC001, UC011-UC014).
2. Household (Hộ khẩu): Lưu thông tin chủ hộ, diện tích căn hộ, số phòng (UC009, UC010).
3. Resident (Nhân khẩu): Lưu thành viên trong hộ, quan hệ với chủ hộ (UC008).
4. Fee (Khoản thu): Định nghĩa các loại phí (phí vệ sinh, phí gửi xe, phí đóng góp...) (UC002-UC004).
5. PaymentSession (Đợt thu): Gom các khoản thu vào một đợt phát động (UC006, UC007).
6. Transaction (Khoản nộp): Lưu lịch sử nộp tiền của từng hộ cho từng khoản (UC005).

Bảng Schema (tóm tắt các bảng / models):

### User
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---:|:---:|---|
| _id | ObjectId | có | Khoá chính |
| username | String | có, unique | Tên đăng nhập |
| password | String | có | Mật khẩu (đã hash) |
| fullName | String | có | Họ và tên |
| role | String | có | enum: `admin`, `manager` |
| createdAt / updatedAt | Date | có | Timestamps |

### Household
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---:|:---:|---|
| _id | ObjectId | có | Khoá chính |
| apartmentNumber | String | có, unique | Số phòng / Mã căn hộ |
| area | Number | có | Diện tích (m2) |
| ownerName | String | có | Tên chủ hộ |
| status | String | có | enum: `active`, `inactive` |
| members | [ObjectId] -> `Resident` | không | Danh sách thành viên (refs) |
| createdAt / updatedAt | Date | có | Timestamps |

### Resident
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---:|:---:|---|
| _id | ObjectId | có | Khoá chính |
| fullName | String | có | Họ và tên |
| idNumber | String | có | CCCD / Số CMND |
| dob | Date | không | Ngày sinh |
| gender | String | không | enum: `male`, `female`, `other` |
| relationToOwner | String | không | Quan hệ với chủ hộ (ví dụ: chủ hộ, vợ/chồng) |
| phone / email | String | không | Thông tin liên hệ |
| status | String | không | enum: `active`, `inactive` |
| household | ObjectId -> `Household` | không | Tham chiếu đến hộ khẩu |
| createdAt / updatedAt | Date | có | Timestamps |

### Fee
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---:|:---:|---|
| _id | ObjectId | có | Khoá chính |
| name | String | có | Tên khoản thu (Vệ sinh, Gửi xe...) |
| type | String | có | enum: `mandatory`, `voluntary` |
| unitPrice | Number | có | Đơn giá (vd: 6000) |
| unit | String | có | enum: `m2`, `person`, `household`, `fixed` |
| description | String | không | Mô tả chi tiết |
| createdAt / updatedAt | Date | có | Timestamps |

### PaymentSession (Đợt thu)
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---:|:---:|---|
| _id | ObjectId | có | Khoá chính |
| title | String | có | Tên đợt thu (vd: "Đợt thu Q1 2026") |
| description | String | không | Mô tả |
| startDate / endDate | Date | không | Khoảng thời gian đợt thu |
| fees | [{ fee: ObjectId -> `Fee`, unitPrice, note }] | không | Danh sách khoản áp dụng trong đợt (cho phép override unitPrice) |
| isActive | Boolean | không | Đang mở/đóng đợt |
| createdBy | ObjectId -> `User` | không | Người tạo |
| createdAt / updatedAt | Date | có | Timestamps |

### Transaction (Khoản nộp)
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---:|:---:|---|
| _id | ObjectId | có | Khoá chính |
| household | ObjectId -> `Household` | có | Hộ nộp tiền |
| fee | ObjectId -> `Fee` | không | Khoản nộp (nếu nộp theo loại) |
| paymentSession | ObjectId -> `PaymentSession` | không | Thuộc đợt thu nào |
| amount | Number | có | Số tiền thực nộp |
| date | Date | có | Ngày nộp |
| payerName | String | không | Tên người nộp (nếu khác chủ hộ) |
| method | String | không | enum: `cash`, `bank`, `card`, `other` |
| note | String | không | Ghi chú |
| createdBy | ObjectId -> `User` | không | Người ghi nhận giao dịch |
| createdAt / updatedAt | Date | có | Timestamps |

Ghi chú thiết kế:
- Sử dụng `ObjectId` để tham chiếu giữa các bảng; đặt `ref` chính xác để dùng `populate()` trong controllers.
- Indexes: đảm bảo index cho `username` (unique), `apartmentNumber` (unique), và có thể thêm index cho `idNumber`/`createdAt` để tăng tốc tìm kiếm và thống kê.
- `PaymentSession.fees` cho phép override `Fee.unitPrice` để phục vụ các trường hợp đợt thu có mức giá tạm thời.
- `Transaction` lưu `paymentSession` để dễ lọc báo cáo theo đợt; cũng có thể lưu `fee` nếu nộp cho khoản cụ thể.

### Giai đoạn 2: Backend Development (API Core)
1. Setup Server Node.js/Express.
2. Xây dựng module Auth (Đăng nhập, phân quyền) trước để bảo mật hệ thống.
3. Xây dựng module Household/Resident (Quản lý dân cư) làm dữ liệu nền.
Xây dựng module Fee/Payment (Quản lý tài chính).
### Giai đoạn 3: Frontend Development (UI/UX)
1. Setup React với Tailwind CSS.
2. Tạo Layout (Sidebar, Header).
3. Thực hiện các trang Dashboard và Quản lý theo thứ tự ưu tiên: Dân cư -> Khoản thu -> Thống kê.
 UPDATE  22/12/2025
 Đã hoàn thành việc xây dựng giao diện tĩnh và tích hợp logic hiển thị cơ bản cho các module chính của hệ thống quản lý chung cư BlueMoon.

#### 1. Kiến trúc Frontend
- Sử dụng **React Router** để định tuyến các trang chức năng.
- Sử dụng **Tailwind CSS** để thiết kế giao diện tùy biến cao.
- Component hóa các thành phần chung: `Modal`, `Sidebar`, `ContentWrapper`.

#### 2. Các màn hình đã hoàn thiện
| STT | Tên màn hình | Trạng thái | Ghi chú |
|-----|----------------------|------------|-------------------------------------------|
| 1 | Dashboard (Tổng quan)| Hiển thị biểu đồ và thông số tổng quan |
| 2 | Quản lý Hộ khẩu  | Đầy đủ UI thêm/sửa/xóa, tìm kiếm |
| 3 | Quản lý Nhân khẩu  | Chi tiết thông tin cư dân |
| 4 | Quản lý Khoản thu  | Danh sách các loại phí dịch vụ |
| 5 | Quản lý Đợt thu  | Quản lý thời gian thu phí |
| 6 | Quản lý Người dùng | Quản lý tài khoản Admin/Mod |


### Giai đoạn 4: Tích hợp & Kiểm thử (Integration & Testing)
1. Kết nối API Backend vào Frontend.
2. Test luồng nghiệp vụ: Tạo hộ -> Tạo khoản thu -> Hộ nộp tiền -> Xuất thống kê.

## 2. Cấu Trúc Thư Mục Chi Tiết
Cấu trúc này được mở rộng từ mẫu quan-ly-dan-cu của bạn, bổ sung các file controller và model tương ứng với UC001 -> UC014.
```
quan-ly-chung-cu/
├── backend/                          # Node.js Express Backend
│   ├── config/
│   │   └── db.js                    # Kết nối MongoDB
│   ├── controllers/                  # Xử lý nghiệp vụ (Logic chính)
│   │   ├── auth.controller.js       # UC001, UC014: Login, Refresh Token
│   │   ├── user.controller.js       # UC011-UC013: CRUD Tài khoản cán bộ
│   │   ├── household.controller.js  # UC008-UC010: Quản lý Hộ khẩu & Nhân khẩu (Biến động, tra cứu)
│   │   ├── fee.controller.js        # UC002-UC004: CRUD Khoản thu (Bắt buộc/Tự nguyện)
│   │   └── payment.controller.js    # UC005-UC007: Thu tiền, Tạo đợt thu, Thống kê
│   ├── middleware/
│   │   ├── auth.middleware.js       # Kiểm tra đăng nhập (JWT)
│   │   ├── role.middleware.js       # Phân quyền (Admin vs Mod vs User)
│   │   └── validate.middleware.js   # Validate dữ liệu đầu vào (Joi/Express-validator)
│   ├── models/                       # Database Schemas
│   │   ├── User.js                  # Model Tài khoản quản trị
│   │   ├── Household.js             # Model Hộ khẩu (Số nhà, diện tích, chủ hộ)
│   │   ├── Resident.js              # Model Nhân khẩu (Thông tin cá nhân, CCCD)
│   │   ├── Fee.js                   # Model Khoản thu (Tên, đơn giá, loại phí)
│   │   └── Transaction.js           # Model Giao dịch nộp tiền (Ai nộp, nộp khoản nào, ngày nộp)
│   ├── routes/                       # API Endpoints
│   │   ├── auth.routes.js           # /api/auth
│   │   ├── user.routes.js           # /api/users
│   │   ├── household.routes.js      # /api/households
│   │   └── fee.routes.js            # /api/fees
│   ├── utils/
│   │   ├── apiError.js              # Class xử lý lỗi chuẩn
│   │   └── excelHandler.js          # Hỗ trợ import/export Excel (cho UC thống kê)
│   ├── .env                         # Biến môi trường
│   ├── server.js                    # File chạy chính
│   └── package.json
│
├── frontend/                         # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                     # Gọi API xuống Backend
│   │   │   ├── axiosClient.js       # Cấu hình Axios chung (Interceptors)
│   │   │   ├── authApi.js           # Login, Logout
│   │   │   ├── householdApi.js      # API dân cư
│   │   │   └── feeApi.js            # API thu phí
│   │   ├── assets/                  # Images, Global Styles
│   │   ├── components/              # UI Components nhỏ
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx        # Dùng cho form Thêm/Sửa (UC002, UC004)
│   │   │   │   └── Table.jsx        # Dùng hiển thị danh sách
│   │   │   └── layout/
│   │   │       ├── Sidebar.jsx      # Menu điều hướng
│   │   │       └── Header.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Lưu trạng thái đăng nhập toàn app
│   │   ├── hooks/                   # Custom Hooks
│   │   │   └── useFetch.js          # Hook tái sử dụng để get data
│   │   ├── pages/                   # Các màn hình chính (Dựa trên hình ảnh Use Case)
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx            # Giao diện UC001
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardPage.jsx        # Tổng quan, biểu đồ nhanh
│   │   │   ├── Household/
│   │   │   │   ├── HouseholdListPage.jsx    # UC010: Tra cứu hộ khẩu
│   │   │   │   └── ResidentInputPage.jsx    # UC008: Biến đổi nhân khẩu
│   │   │   ├── Fees/
│   │   │   │   ├── FeeManagerPage.jsx       # UC002-UC004: QL Khoản thu
│   │   │   │   └── PaymentCollectionPage.jsx # UC005, UC006: Ghi nhận đóng phí
│   │   │   ├── Stats/
│   │   │   │   └── RevenueReportPage.jsx    # UC007: Thống kê đợt thu
│   │   │   └── Admin/
│   │   │       └── UserManagementPage.jsx   # UC011-UC013: QL tài khoản cán bộ
│   │   ├── routes/
│   │   │   ├── AppRouter.jsx        # Định nghĩa đường dẫn
│   │   │   └── PrivateRoute.jsx     # Chặn truy cập nếu chưa login
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Tailwind imports
│   ├── .env
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 3. Phân Tích Chi Tiết Các Use Case vào File Code
Để bạn dễ hình dung code nằm ở đâu:
1. UC001 (Đăng nhập) & UC014 (Đổi mật khẩu):
Backend: controllers/auth.controller.js (hàm login, changePassword).
2. Frontend: pages/Auth/LoginPage.jsx.
UC002, UC003, UC004 (Thêm/Sửa/Xóa Khoản thu):
3. Backend: controllers/fee.controller.js (CRUD Fee).
Database: Model Fee.
Frontend: pages/Fees/FeeManagerPage.jsx (Dùng Modal để thêm/sửa).
UC005 (CRUD Khoản nộp của hộ):
Backend: controllers/payment.controller.js. Logic: Tạo bản ghi Transaction nối giữa Household và Fee.
Frontend: pages/Fees/PaymentCollectionPage.jsx. Giao diện chọn hộ dân -> chọn khoản phí -> nhập số tiền -> Lưu.
UC008, UC009, UC010 (Quản lý Nhân khẩu/Hộ khẩu):
Backend: controllers/household.controller.js.
Frontend: pages/Household/HouseholdListPage.jsx. Cần chức năng tìm kiếm, lọc và xem chi tiết thành viên trong hộ.
UC007 (Thống kê đợt thu):
Backend: controllers/payment.controller.js (hàm getStatistics). Sử dụng MongoDB Aggregation để tính tổng tiền.
Frontend: pages/Stats/RevenueReportPage.jsx. Hiển thị biểu đồ hoặc bảng số liệu.
## 4. Công nghệ Khuyến nghị
1. Database: MongoDB (Linh hoạt cho việc thay đổi cấu trúc nhân khẩu).
2. Backend: Node.js + Express.
3. Frontend: React (Vite) + Tailwind CSS (Style nhanh) + Ant Design hoặc Material UI (Cho các bảng biểu Data Table đẹp).
4. State Management: React Context API (Đủ dùng) hoặc Redux Toolkit (Nếu dự án mở rộng lớn).


## 5 Hướng dẫn chạy nhanh (Cho người tạo file)

Giả sử thư mục dự án của bạn tên là quan-ly-chung-cu và bạn đang mở Terminal tại thư mục này.

### Backend:

Bước 1: Di chuyển vào folder backend:
cd backend

Bước 2: Khởi tạo và cài đặt:

Tạo file package.json: npm init -y

Cài thư viện: npm install express mongoose dotenv cors bcryptjs jsonwebtoken

Bước 3: Tạo file code:

Copy toàn bộ code Backend ở trên vào các file trong thư mục backend/.

Lưu ý quan trọng: Đảm bảo bạn đã tạo đủ các folder con: routes, models, middleware, config, controllers và các file bên trong nó.

Bước 4: Chạy Server:

Vẫn đứng ở thư mục backend, chạy lệnh: node server.js

Nếu thấy thông báo "Server running..." và "MongoDB Connected..." là thành công.

### Frontend (Làm mới hoàn toàn):

Quan trọng: Nếu bạn đã lỡ tạo thủ công thư mục frontend và bị lỗi, hãy XÓA thư mục đó đi trước khi bắt đầu. Đừng tự tạo folder trống.

Bước 1: Quay lại thư mục gốc:
cd .. (Nếu đang ở backend) hoặc mở terminal mới tại quan-ly-chung-cu.

Bước 2: Tạo dự án React (Tự động tạo folder):
Chạy lệnh sau và đợi nó chạy xong:
npm create vite@latest frontend -- --template react

Bước 3: Di chuyển vào folder frontend:
cd frontend

Bước 4: Cài đặt các gói phụ thuộc (Bắt buộc):
Copy và chạy lần lượt các lệnh sau:

npm install
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


Bước 5: Copy code:
Copy các file code mẫu (App.jsx, LoginPage.jsx...) vào thư mục frontend/src.

Bước 6: Chạy Frontend:
npm run dev


## 6 Hướng dẫn chạy dự án khi Clone từ Git về (Cho người mới)

Đây là quy trình chuẩn khi bạn clone code này về một máy tính khác. Hướng dẫn này hỗ trợ MongoDB trên cloud (Atlas) hoặc local.

### Yêu cầu

- **Node.js** đã được cài đặt (LTS từ https://nodejs.org)
- **npm** (tự động khi cài Node.js)
- **MongoDB** (tùy chọn):
  - Sử dụng **MongoDB Atlas** (Cloud, khuyến nghị cho người mới) — Tạo cluster miễn phí tại https://cloud.mongodb.com
  - Hoặc **MongoDB local** — Cài đặt từ https://www.mongodb.com/try/download/community

### Bước 0: Chuẩn bị MongoDB URI (nếu chưa có)

#### Nếu dùng MongoDB Atlas (Cloud):

1. Vào https://cloud.mongodb.com và đăng nhập / tạo tài khoản
2. Tạo một **Cluster** miễn phí
3. Vào **Database Access** → tạo một user (lưu username và password)
4. Vào **Network Access** → cho phép IP của bạn (hoặc thêm 0.0.0.0/0 để cho phép tất cả, chỉ dùng tạm)
5. Vào **Clusters** → **Connect** → **Connect your application** → chọn **Node.js**
6. Copy chuỗi kết nối (URI) và thay thế:
   - `<password>` → password của user vừa tạo
   - `<dbname>` → tên database của bạn (vd: `quan_ly_chung_cu`)

Ví dụ URI:
```
mongodb+srv://myUser:myPassword@cluster0.xxxxx.mongodb.net/quan_ly_chung_cu?retryWrites=true&w=majority
```

#### Nếu dùng MongoDB local:

```
mongodb://localhost:27017/quan_ly_chung_cu
```

### Bước 1: Clone dự án

```powershell
git clone https://github.com/deanzedd/SE-IT3180.git
cd SE-IT3180
```

### Bước 2: Cài đặt và chạy Backend

#### 2.1 Vào thư mục backend:
```powershell
cd backend
```

#### 2.2 Cài đặt thư viện:
```powershell
npm install
```

#### 2.3 Tạo file `.env`:

Tạo file tên ``.env`` trong thư mục `backend` với nội dung sau (thay MongoDB URI của bạn):

```
PORT=5000
MONGO_URI=mongodb+srv://myUser:myPassword@cluster0.xxxxx.mongodb.net/quan_ly_chung_cu?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here_min_32_chars_long
JWT_EXPIRE=30d
```

**Lưu ý quan trọng:**
- Thay `MONGO_URI` bằng chuỗi kết nối MongoDB của bạn (từ Bước 0)
- Để tạo `JWT_SECRET` an toàn, chạy lệnh PowerShell sau:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Lấy kết quả và dán vào `JWT_SECRET`

#### 2.4 Chạy server backend:
```powershell
npm start
```

Kết quả mong muốn:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

### Bước 3: Tạo admin user (cho lần đầu)

**Tại cửa sổ terminal backend đang chạy**, mở một **terminal mới** (PowerShell hoặc cmd) và:

```powershell
cd backend
node scripts/seedAdmin.js
```

Kết quả:
```
Connecting to MongoDB...
✓ Connected to MongoDB
✓ Admin user created successfully!
  Username: admin
  Full Name: Administrator
  Role: admin
  ID: <mongo-id>
✓ Connection closed
```

**Thông tin đăng nhập mặc định:**
- Username: `admin`
- Password: `Admin123!`

Bạn có thể thay đổi password sau khi đăng nhập lần đầu.

### Bước 4: Cài đặt và chạy Frontend

**Mở một terminal mới** (đừng đóng terminal backend) từ thư mục gốc:

#### 4.1 Vào thư mục frontend:
```powershell
cd frontend
```

#### 4.2 Cài đặt thư viện:
```powershell
npm install
```

#### 4.3 Chạy web:
```powershell
npm run dev
```

Kết quả sẽ hiển thị:
```
VITE v7.2.5 ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Bước 5: Truy cập ứng dụng

1. Mở trình duyệt và vào http://localhost:5173
2. Đăng nhập bằng:
   - **Username:** `admin`
   - **Password:** `Admin123!`
3. Bạn sẽ vào Dashboard

### Bước 6: Test API (Tùy chọn)

Để test API từ VS Code, hãy:

1. Cài đặt extension **REST Client** (ID: `humao.rest-client`)
2. Mở file `backend/test-login.http` để test login API
3. Click **Send Request** trong file đó

Hoặc dùng lệnh `curl` từ PowerShell:
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"Admin123!\"}'
```

### Ghi chú quan trọng

- **File `.env` không nên commit vào Git** — Thêm vào `.gitignore` nếu chưa có
- **JWT_SECRET phải giữ bí mật** — Không chia sẻ với người khác
- **Khi dừng chạy:** Nhấn Ctrl+C trong terminal backend và frontend
- **Lỗi "npm: The term 'npm' is not recognized"?**
  - Restart PowerShell / VSCode terminal
  - Hoặc: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force` (Windows)
- **Lỗi kết nối MongoDB?**
  - Kiểm tra MongoDB URI trong `.env`
  - Kiểm tra IP whitelist trên MongoDB Atlas (nếu dùng cloud)
  - Kiểm tra MongoDB service đang chạy (nếu dùng local)
 



