const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { 
    getTransactions,
    createTransaction,
    editTransaction,
    deleteTransaction} = require('../controllers/transaction.controller');

router.use(protect);

// Route cho các thao tác Lấy danh sách (GET) và Tạo mới (POST)
// Endpoint: /api/transactions
router.route('/')
    .get(authorize('admin', 'manager', 'accountant'), getTransactions)        // Lấy danh sách Giao dịch
    .post(authorize('admin', 'accountant'), createTransaction);   // Tạo Giao dịch mới
// Route cho các thao tác Sửa (PUT) theo ID
// Endpoint: /api/transactions/:id
router.route('/:id')
    .put(authorize('admin', 'accountant'), editTransaction)    // Sửa Giao dịch theo ID
    .delete(authorize('admin', 'accountant'), deleteTransaction);
module.exports = router;