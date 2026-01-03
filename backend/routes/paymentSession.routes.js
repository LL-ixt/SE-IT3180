const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { getPaymentSessions,
    createPaymentSession,
    editPaymentSession,
    deletePaymentSession,
    deleteFeeInPaymentSession,
    getInvoicesBySession,
    updateInvoicesForFee,
    getPaymentDetails,
    updateColumnQuantity,
    toggleFeePayment,
    calculateAutoFees } = require('../controllers/paymentSession.controller');
const { getTransactionsBySession } = require('../controllers/transaction.controller');

router.use(protect);

// Route cho các thao tác Lấy danh sách (GET) và Tạo mới (POST)
// Endpoint: /api/paymentSession
router.route('/')
    .get(authorize('admin', 'manager', 'accountant'), getPaymentSessions)    // Lấy tất cả Đợt thu
    .post(authorize('admin', 'accountant'), createPaymentSession); // Tạo Đợt thu mới
// Route cho các thao tác Sửa (PUT) và Xóa (DELETE) theo ID
// Endpoint: /api/paymentSession/:id
router.route('/:id')
    .put(authorize('admin', 'accountant'), editPaymentSession)    // Sửa Đợt thu theo ID
    .delete(authorize('admin', 'accountant'), deletePaymentSession); // Xóa Đợt thu theo ID
// Endpoint: /api/paymentSessions/:id/transactions
router.route('/:id/transactions') 
    .get(authorize('admin', 'manager', 'accountant'), getTransactionsBySession);

// Endpoint: /api/paymentSessions/:id/invoices
router.route('/:id/invoices')
    .get(authorize('admin', 'manager', 'accountant'), getInvoicesBySession);

// Endpoint: /api/paymentSessions/:id/fees/:feeId/invoices
router.route('/:id/fees/:feeId/invoices')
    .put(authorize('admin', 'accountant'), updateInvoicesForFee);

router.route('/:session_id/:fee_id')
    .delete(authorize('admin', 'accountant'), deleteFeeInPaymentSession);

router.route('/:id/details')
    .get(authorize('admin', 'manager', 'accountant'), getPaymentDetails);

router.route('/:id/columns/:feeId')
    .put(authorize('admin', 'accountant'), updateColumnQuantity);

router.route('/details/:id/toggle')
    .put(authorize('admin', 'accountant'), toggleFeePayment);

router.route('/:id/calculate-auto-fees')
    .post(authorize('admin', 'accountant'), calculateAutoFees);
module.exports = router;