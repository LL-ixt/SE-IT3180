const express = require('express');
const router = express.Router();

const { 
    createResident,
    updateResident,
    getResidents,
    deleteResident} = require('../controllers/resident.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Áp dụng middleware xác thực cho tất cả routes
router.use(protect);

router.route('/')
    .get(authorize('admin', 'manager', 'accountant'), getResidents)
    .post(authorize('admin', 'manager'), createResident);

router.route('/:id')
    .delete(authorize('admin', 'manager'), deleteResident)
    .put(authorize('admin', 'manager'), updateResident);
module.exports = router;