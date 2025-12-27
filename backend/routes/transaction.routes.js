const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
    getTransactions,
    createTransaction,
    editTransaction} = require('../controllers/transaction.controller');

// Route cho các thao tác Lấy danh sách (GET) và Tạo mới (POST)
// Endpoint: /api/transactions
router.route('/')
    .get(protect, getTransactions)        // Lấy danh sách Giao dịch
    .post(protect, createTransaction);   // Tạo Giao dịch mới
// Route cho các thao tác Sửa (PUT) theo ID
// Endpoint: /api/transactions/:id
router.route('/:id')
    .put(protect, editTransaction)    // Sửa Giao dịch theo ID
module.exports = router;