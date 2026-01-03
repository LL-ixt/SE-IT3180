const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser 
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Áp dụng bảo vệ (đăng nhập) và phân quyền (chỉ Admin) cho toàn bộ router này
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/users - Get all users
// @route   POST /api/users - Create new user
// @access  Private (Admin only)
router.route('/')
    .get(getUsers)
    .post(createUser);

// @route   GET /api/users/:id - Get user by ID
// @route   PUT /api/users/:id - Update user
// @route   DELETE /api/users/:id - Delete user
// @access  Private (Admin only)
router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
