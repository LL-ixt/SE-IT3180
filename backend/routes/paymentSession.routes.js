const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getPaymentSessions,
    createPaymentSession,
    editPaymentSession,
    deletePaymentSession,
    deleteFeeInPaymentSession,
    getInvoicesBySession,
    updateInvoicesForFee } = require('../controllers/paymentSession.controller');
const { getTransactionsBySession } = require('../controllers/transaction.controller');

// Route cho các thao tác Lấy danh sách (GET) và Tạo mới (POST)
// Endpoint: /api/paymentSession
router.route('/')
    .get(protect, getPaymentSessions)    // Lấy tất cả Đợt thu
    .post(protect, createPaymentSession) // Tạo Đợt thu mới
// Route cho các thao tác Sửa (PUT) và Xóa (DELETE) theo ID
// Endpoint: /api/paymentSession/:id
router.route('/:id')
    .put(protect, editPaymentSession)    // Sửa Đợt thu theo ID
    .delete(protect, deletePaymentSession) // Xóa Đợt thu theo ID
// Endpoint: /api/paymentSessions/:id/transactions
router.route('/:id/transactions') 
    .get(protect, getTransactionsBySession);

// Endpoint: /api/paymentSessions/:id/invoices
router.route('/:id/invoices')
    .get(protect, getInvoicesBySession);

// Endpoint: /api/paymentSessions/:id/fees/:feeId/invoices
router.route('/:id/fees/:feeId/invoices')
    .put(protect, updateInvoicesForFee);

router.route('/:session_id/:fee_id')
    .delete(protect, deleteFeeInPaymentSession)
module.exports = router;