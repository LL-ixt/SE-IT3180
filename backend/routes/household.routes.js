const express = require('express');
const router = express.Router();
const { getHouseholds, createHousehold } = require('../controllers/household.controller');
const { protect } = require('../middleware/auth.middleware');

// GET để lấy danh sách, POST để tạo mới
// Thêm middleware 'protect' nếu muốn yêu cầu đăng nhập mới được gọi
router.route('/')
    .get(protect, getHouseholds)
    .post(protect, createHousehold);

module.exports = router;