const express = require('express');
const router = express.Router();
const { getHouseholds, createHousehold, deleteHousehold, updateHousehold } = require('../controllers/household.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Áp dụng middleware xác thực cho tất cả routes
router.use(protect);

router.route('/')
    .get(authorize('admin', 'manager', 'accountant'), getHouseholds)
    .post(authorize('admin', 'manager'), createHousehold);

router.route('/:id')
    .delete(authorize('admin', 'manager'), deleteHousehold)
    .put(authorize('admin', 'manager'), updateHousehold);
module.exports = router;