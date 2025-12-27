const PaymentSession = require('../models/paymentSession');
const Transaction = require('../models/transaction');
const Fee = require('../models/fee');
const mongoose = require('mongoose');
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
// --- TRANSACTION (Giao dịch nộp tiền - UC005, UC007) ---

// @desc      Get all transactions
// @route     GET /api/transactions
// @access    Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('household fee paymentSession')
            .sort({ date: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};

// @desc      Create new transaction (Ghi nhận nộp tiền)
// @route     POST /api/payments/transactions
// @access    Private
const createTransaction = async (req, res) => {
    // household: ObjectId, fee/paymentSession: ObjectId (Tùy chọn), amount: Number, payerName: String
    const { household, paymentSession, fee, amount, payerName, method } = req.body;

    if (!household || !amount) {
        return res.status(400).json({ message: 'Household ID and Amount are required for a transaction.' });
    }
    
    // Tùy chọn: Thêm logic kiểm tra xem hộ đã nộp cho khoản này trong đợt này chưa (UC005 logic)

    try {
        const transaction = new Transaction({
            household,
            paymentSession,
            fee,
            amount,
            payerName,
            method,
            createdBy: req.user._id
        });

        const createdTransaction = await transaction.save();
        res.status(201).json(createdTransaction);
    } catch (error) {
        res.status(400).json({ message: 'Error creating transaction', error: error.message });
    }
};

// @desc      Update existing transaction
// @route     PUT /api/payments/transactions/:id
// @access    Private
const editTransaction = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Invalid Transaction ID format' });
    }

    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            req.body, 
            { new: true, runValidators: true }
        ).populate('household fee paymentSession'); // Populate để trả về thông tin chi tiết

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(updatedTransaction);
    } catch (error) {
        res.status(400).json({ message: 'Error updating transaction', error: error.message });
    }
};

// @desc      Get transactions by session ID (Thống kê/Truy vấn)
// @route     GET /api/payments/sessions/:id/transactions
// @access    Private
const getTransactionsBySession = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Invalid Session ID format' });
    }

    try {
        const transactions = await Transaction.find({ paymentSession: id })
            .populate('household fee')
            .sort({ date: 1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};

module.exports = {
    getTransactions,
    createTransaction,
    editTransaction,
    getTransactionsBySession
};