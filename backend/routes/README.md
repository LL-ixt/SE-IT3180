# API Endpoints & Phân Quyền (RBAC)

Hệ thống phân quyền dựa trên 3 vai trò: **Admin**, **Manager**, **Accountant**.

## Ma trận phân quyền

| Nhóm chức năng | Admin | Manager | Accountant |
| :--- | :---: | :---: | :---: |
| **Quản lý người dùng** | ✔️ Full | ❌ | ❌ |
| **Quản lý Căn hộ / Cư dân** | ✔️ Full | ✔️ Full | 👁 Read-only |
| **Quản lý Tài chính (Phí, Thu)** | ✔️ Full | 👁 Read-only | ✔️ Full |

## Hướng dẫn áp dụng Middleware

Sử dụng `authorize` từ `../middleware/role.middleware.js`.

### 1. Routes Quản lý Người dùng (`/api/users`)
Chỉ Admin được phép truy cập toàn bộ.
```javascript
router.use(authorize('admin')); 
// Các routes bên dưới sẽ chỉ nhận admin
```

### 2. Routes Căn hộ & Cư dân (`/api/households`, `/api/residents`)
- **Manager**: Có quyền sửa đổi (Full).
- **Accountant**: Chỉ xem (Read-only).
```javascript
// Xem danh sách (GET): Cho phép tất cả
router.get('/', authorize('admin', 'manager', 'accountant'), controller.getAll);

// Thêm/Sửa/Xóa (POST, PUT, DELETE): Chỉ Admin và Manager
router.post('/', authorize('admin', 'manager'), controller.create);
```

### 3. Routes Tài chính (`/api/fees`, `/api/payment-sessions`, `/api/transactions`)
- **Accountant**: Có quyền sửa đổi (Full).
- **Manager**: Chỉ xem (Read-only).
```javascript
// Xem danh sách (GET): Cho phép tất cả
router.get('/', authorize('admin', 'manager', 'accountant'), controller.getAll);

// Thêm/Sửa/Xóa (POST, PUT, DELETE): Chỉ Admin và Accountant
router.post('/', authorize('admin', 'accountant'), controller.create);
```