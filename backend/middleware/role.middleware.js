const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ACCOUNTANT: 'accountant'
};

/**
 * Middleware phân quyền (Authorization)
 * @param {...string} allowedRoles - Danh sách các role được phép truy cập (VD: 'manager', 'accountant')
 * Lưu ý: Admin luôn được mặc định có quyền truy cập tất cả (Superuser).
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Kiểm tra xem user đã đăng nhập chưa (thông qua auth middleware trước đó)
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized: Yêu cầu đăng nhập để thực hiện chức năng này.' 
            });
        }

        // 1. Admin luôn có quyền truy cập
        if (req.user.role === ROLES.ADMIN) {
            return next();
        }

        // 2. Kiểm tra role của user có nằm trong danh sách cho phép không
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }

        // 3. Từ chối truy cập
        return res.status(403).json({ 
            success: false, 
            message: `Forbidden: Vai trò '${req.user.role}' không có quyền thực hiện tác vụ này.` 
        });
    };
};

module.exports = { authorize, ROLES };
