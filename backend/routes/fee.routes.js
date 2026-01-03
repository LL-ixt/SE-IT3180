const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { getFees, createFee, editFee, deleteFee } = require('../controllers/fee.controller');

router.use(protect);

// Route cho các thao tác Lấy danh sách (GET) và Tạo mới (POST)
// Endpoint: /api/fees
router.route('/')
    .get(authorize('admin', 'manager', 'accountant'), getFees)    // Lấy tất cả Khoản thu
    .post(authorize('admin', 'accountant'), createFee); // Tạo Khoản thu mới

// Route cho các thao tác Sửa (PUT) và Xóa (DELETE) theo ID
// Endpoint: /api/fees/:id
router.route('/:id')
    .put(authorize('admin', 'accountant'), editFee)    // Sửa Khoản thu theo ID
    .delete(authorize('admin', 'accountant'), deleteFee); // Xóa Khoản thu theo ID

module.exports = router;