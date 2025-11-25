# Kế Hoạch & Cấu Trúc Dự Án Quản Lý Chung Cư
Tài liệu này mô tả luồng phát triển và cấu trúc thư mục chi tiết cho dự án Quản lý chung cư (MERN Stack), được tùy biến dựa trên danh sách Use Case (UC001 - UC014) và mô hình phân rã chức năng đã cung cấp.
## 1. Luồng Dự Án (Project Flow)
Để đảm bảo các chức năng trong ảnh (Quản lý khoản thu, hộ khẩu, đợt thu...) hoạt động trơn tru, dự án nên được triển khai theo 5 giai đoạn:
### Giai đoạn 1: Khởi tạo & Thiết kế CSDL (Database Design)
Đây là bước quan trọng nhất để map các Use Case vào dữ liệu.
#### Thiết kế Schema:
1. User: Dành cho admin/cán bộ quản lý đăng nhập (UC001, UC011-UC014).
2. Household (Hộ khẩu): Lưu thông tin chủ hộ, diện tích căn hộ, số phòng (UC009, UC010).
3. Resident (Nhân khẩu): Lưu thành viên trong hộ, quan hệ với chủ hộ (UC008).
4. Fee (Khoản thu): Định nghĩa các loại phí (phí vệ sinh, phí gửi xe, phí đóng góp...) (UC002-UC004).
5. PaymentSession (Đợt thu): Gom các khoản thu vào một đợt phát động (UC006, UC007).
Transaction (Khoản nộp): Lưu lịch sử nộp tiền của từng hộ cho từng khoản (UC005).
### Giai đoạn 2: Backend Development (API Core)
1. Setup Server Node.js/Express.
2. Xây dựng module Auth (Đăng nhập, phân quyền) trước để bảo mật hệ thống.
3. Xây dựng module Household/Resident (Quản lý dân cư) làm dữ liệu nền.
Xây dựng module Fee/Payment (Quản lý tài chính).
### Giai đoạn 3: Frontend Development (UI/UX)
1. Setup React với Tailwind CSS.
2. Tạo Layout (Sidebar, Header).
3. Thực hiện các trang Dashboard và Quản lý theo thứ tự ưu tiên: Dân cư -> Khoản thu -> Thống kê.
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

## 5 Hướng dẫn chạy nhanh

### Backend:

1. Tạo file package.json: npm init -y.

2. Cài thư viện: npm install express mongoose dotenv cors bcryptjs jsonwebtoken.

3. Copy các file code trên vào đúng thư mục.

4. Chạy: node server.js.

### Frontend:

1. Tạo dự án: npm create vite@latest frontend -- --template react.

2. Cài thư viện: npm install axios react-router-dom.

3. Cài Tailwind CSS (theo hướng dẫn chuẩn của Tailwind).

4. Copy code vào src.

5. Chạy: npm run dev.







Hướng dẫn chạy nhanh (Đã cập nhật đường dẫn & Lưu ý)

Giả sử thư mục dự án của bạn tên là quan-ly-chung-cu và bạn đang mở Terminal tại thư mục này.

Backend:

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

Frontend (Làm mới hoàn toàn):

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