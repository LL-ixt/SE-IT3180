const PaymentSession = require('../models/paymentSession');
const Transaction = require('../models/transaction');
const Fee = require('../models/fee');
const Invoice = require('../models/invoice');
const mongoose = require('mongoose');
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
// --- TRANSACTION (Giao dịch nộp tiền - UC005, UC007) ---

// @desc      Get all transactions
// @route     GET /api/transactions
// @access    Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('household')
            .populate({
                path: 'invoice',
                populate: { path: 'paymentSession fee' } // Populate nested info
            })
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
    let { household, invoice, fee, paymentSession, amount, payerName, method } = req.body;

    if (!household || !amount) {
        return res.status(400).json({ message: 'Household ID and Amount are required for a transaction.' });
    }
    
    // Tùy chọn: Thêm logic kiểm tra xem hộ đã nộp cho khoản này trong đợt này chưa (UC005 logic)

    try {
        // CASE: Voluntary Fee (or Manual) where Invoice doesn't exist yet
        if (!invoice && fee && paymentSession) {
            // Check if invoice exists (to avoid duplicates if frontend logic slips)
            let targetInvoice = await Invoice.findOne({ household, fee, paymentSession });
            
            if (!targetInvoice) {
                // Create new invoice on the fly
                // For voluntary, the "required amount" is effectively what they are paying now
                targetInvoice = await Invoice.create({
                    household,
                    fee,
                    paymentSession,
                    amount: Number(amount), // Set debt equal to payment amount
                    paidAmount: 0,
                    status: 'unpaid' // Will be updated to 'paid' below
                });
            }
            invoice = targetInvoice._id;
        }

        // Update Invoice status if invoice ID is provided
        if (invoice) {
            const targetInvoice = await Invoice.findById(invoice);
            if (targetInvoice) {
                targetInvoice.paidAmount = (targetInvoice.paidAmount || 0) + Number(amount);
                
                if (targetInvoice.paidAmount >= targetInvoice.amount) {
                    targetInvoice.status = 'paid';
                } else {
                    targetInvoice.status = 'partial';
                }
                await targetInvoice.save();
            }
        }

        const transaction = new Transaction({
            household,
            invoice,
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
        ).populate('household')
         .populate({
            path: 'invoice',
            populate: { path: 'paymentSession fee' }
         });

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
        // 1. Find all invoices for this session
        const invoices = await Invoice.find({ paymentSession: id }).select('_id');
        const invoiceIds = invoices.map(inv => inv._id);

        // 2. Find transactions linked to those invoices
        const transactions = await Transaction.find({ invoice: { $in: invoiceIds } })
            .populate('household')
            .populate({
                path: 'invoice',
                populate: { path: 'fee paymentSession' }
            })
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