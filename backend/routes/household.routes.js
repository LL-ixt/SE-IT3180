const express = require('express');
const router = express.Router();
const { getHouseholds, createHousehold, deleteHousehold, updateHousehold } = require('../controllers/household.controller');
const { protect } = require('../middleware/auth.middleware');

// Thêm middleware 'protect' nếu muốn yêu cầu đăng nhập mới được gọi
router.route('/')
    .get(protect, getHouseholds)
    .post(protect, createHousehold)

router.route('/:id')
    .delete(protect, deleteHousehold)
    .put(protect, updateHousehold)
module.exports = router;