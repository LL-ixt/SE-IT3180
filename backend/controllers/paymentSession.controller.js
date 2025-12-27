const PaymentSession = require('../models/paymentSession');
const Fee = require('../models/fee');
const mongoose = require('mongoose');
const Invoice = require('../models/invoice');
const Transaction = require('../models/transaction');
const invoiceService = require('../services/invoice.service');
// Helper function to check for valid ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- PAYMENT SESSION (Đợt thu - UC006, UC007) ---

// @desc      Get all payment sessions
// @route     GET /api/payments/sessions
// @access    Private
const getPaymentSessions = async (req, res) => {
    try {
        // Populate fees to see which specific Fee model is referenced
        const sessions = await PaymentSession.find({})
            .populate({
                path: 'fees.fee', // Đi sâu vào mảng 'fees', populate trường 'fee'
                select: 'name type unit' // Chỉ lấy các trường cần thiết từ Fee Model
            })
            .sort({ startDate: -1 }); // Sắp xếp theo ngày gần nhất

        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment sessions', error: error.message });
    }
};

// @desc      Create new payment session
// @route     POST /api/paymentSession
// @access    Private
const createPaymentSession = async (req, res) => {
    const { title, description, startDate, endDate, fees } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required to create a payment session.' });
    }

    try {
        const session = new PaymentSession({
            title,
            description,
            startDate,
            endDate,
            fees,
            createdBy: req.user._id // Gán ID của người dùng đang đăng nhập (từ req.user được gán bởi middleware protect)
        });

        const createdSession = await session.save();
        
        // Auto-generate invoices for all households
        await invoiceService.generateInvoicesForSession(createdSession);

        res.status(201).json(createdSession);
    } catch (error) {
        res.status(400).json({ message: 'Error creating payment session', error: error.message });
    }
};

// @desc      Update payment session
// @route     PUT /api/payments/sessions/:id
// @access    Private
const editPaymentSession = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Invalid Session ID format' });
    }

    try {
        const updatedSession = await PaymentSession.findByIdAndUpdate(
            id,
            req.body, // Cập nhật tất cả các trường được gửi trong body
            { new: true, runValidators: true } // Trả về bản ghi mới và chạy validator
        ).populate({
            path: 'fees.fee',
            select: 'name type unit'
        });

        if (!updatedSession) {
            return res.status(404).json({ message: 'Payment Session not found' });
        }

        // Auto-generate invoices for any new fees added during update
        await invoiceService.generateInvoicesForSession(updatedSession);

        res.status(200).json(updatedSession);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment session', error: error.message });
    }
};

// @desc      Delete payment session
// @route     DELETE /api/payments/sessions/:id
// @access    Private
//CHỈ SỬ DỤNG ĐỂ XÓA NHỮNG ĐỢT THU RÁC
const deletePaymentSession = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Invalid Session ID format' });
    }

    try {
        // 1. Tìm các Invoice thuộc đợt thu này để xóa Transaction tương ứng
        const invoices = await Invoice.find({ paymentSession: id });
        const invoiceIds = invoices.map(inv => inv._id);
    
        // 2. Xóa tất cả Transactions thuộc các Invoice này
        await Transaction.deleteMany({ invoice: { $in: invoiceIds } });

        // 3. Xóa tất cả Invoices
        await Invoice.deleteMany({ paymentSession: id });

        // 4. Cuối cùng mới xóa Session
        const result = await PaymentSession.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Payment Session not found' });
        }

        res.status(200).json({ message: 'Payment Session successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment session', error: error.message });
    }
};

// @desc      Delete a fee in a payment session
// @route     DELETE /api/payments/sessions/:session_id/:fee_id
// @access    Private
const deleteFeeInPaymentSession = async (req, res) => {
    try {
        const { session_id, fee_id } = req.params;

        const session = await PaymentSession.findByIdAndUpdate(
            session_id,
            { 
                $pull: { fees: { _id: fee_id } } 
            },
            { new: true }
        ).populate('fees.fee');

        if (!session) {
            return res.status(404).json({ message: "Không tìm thấy đợt thu" });
        }

        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc      Get invoices for a session (optionally filtered by household)
// @route     GET /api/payments/sessions/:id/invoices
// @access    Private
const getInvoicesBySession = async (req, res) => {
    const { id } = req.params;
    const { householdId } = req.query;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Invalid Session ID format' });
    }

    try {
        const query = { paymentSession: id };
        if (householdId) {
             if (!isValidId(householdId)) {
                return res.status(400).json({ message: 'Invalid Household ID format' });
            }
            query.household = householdId;
        }

        const invoices = await Invoice.find(query)
            .populate('fee', 'name unit unitPrice')
            .populate('household', 'apartmentNumber owner')
            .sort({ 'household.apartmentNumber': 1 });

        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
};

// @desc      Bulk update/create invoices for a specific fee in a session
// @route     PUT /api/payments/sessions/:id/fees/:feeId/invoices
// @access    Private
const updateInvoicesForFee = async (req, res) => {
    const { id, feeId } = req.params;
    const { invoices } = req.body; // Array of { householdId, amount }

    if (!isValidId(id) || !isValidId(feeId)) {
        return res.status(400).json({ message: 'Invalid IDs' });
    }

    try {
        const operations = invoices.map(inv => ({
            updateOne: {
                filter: { paymentSession: id, fee: feeId, household: inv.householdId },
                update: { $set: { amount: Number(inv.amount) } },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Invoice.bulkWrite(operations);
        }

        res.status(200).json({ message: 'Invoices updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating invoices', error: error.message });
    }
};

module.exports = {
    getPaymentSessions,
    createPaymentSession,
    editPaymentSession,
    deletePaymentSession,
    deleteFeeInPaymentSession,
    getInvoicesBySession,
    updateInvoicesForFee
};