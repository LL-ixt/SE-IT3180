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
// @desc      Create new transaction (Ghi nhận nộp tiền)
// @route     POST /api/payments/transactions
// @access    Private
const createTransaction = async (req, res) => {
    // 1. Lấy dữ liệu từ body (Bỏ qua invoice)
    const { household, paymentSession, amount, payerName, method, date, note } = req.body;

    // 2. Kiểm tra các trường bắt buộc
    if (!household || !amount || !paymentSession) {
        return res.status(400).json({ 
            message: 'Household ID, PaymentSession ID và Amount là bắt buộc.' 
        });
    }

    try {
        // 3. Khởi tạo transaction mới - ĐÃ THÊM paymentSession VÀO ĐÂY
        const transaction = new Transaction({
            household,
            paymentSession, // Lưu tham chiếu trực tiếp đến đợt thu
            amount: Number(amount),
            payerName,
            method,
            date: date || new Date(),
            note,
            status: 'unchecked', // Trạng thái mặc định để hiện ở cột "Chưa duyệt"
            createdBy: req.user._id // Lấy ID người dùng từ middleware auth
        });

        // 4. Lưu vào Database
        const createdTransaction = await transaction.save();

        // Debug để kiểm tra dữ liệu sau khi lưu
        console.log("Đã tạo giao dịch mới:", createdTransaction);

        res.status(201).json(createdTransaction);
    } catch (error) {
        console.error("Lỗi khi tạo giao dịch:", error);
        res.status(400).json({ 
            message: 'Error creating transaction', 
            error: error.message 
        });
    }
};

// @desc      Update existing transaction
// @route     PUT /api/payments/transactions/:id
// @access    Private
const editTransaction = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Định dạng ID giao dịch không hợp lệ' });
    }

    try {
        // 1. Cập nhật giao dịch
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            req.body, 
            { new: true, runValidators: true }
        )
        .populate('household') // Bắt buộc phải có để hiện số phòng sau khi update
        .populate('paymentSession', 'title'); // Lấy thông tin đợt thu nếu cần

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        // 2. Log để debug xem status đã đổi chưa
        console.log(`Cập nhật giao dịch ${id} thành công. Trạng thái mới: ${updatedTransaction.status}`);

        res.status(200).json(updatedTransaction);
    } catch (error) {
        console.error("Lỗi cập nhật giao dịch:", error);
        res.status(400).json({ message: 'Lỗi khi cập nhật giao dịch', error: error.message });
    }
};

// @desc      Get transactions by session ID (Thống kê/Truy vấn)
// @route     GET /api/payments/sessions/:id/transactions
// @access    Private
const getTransactionsBySession = async (req, res) => {
    const { id } = req.params; // Đây là ID của PaymentSession

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Định dạng Session ID không hợp lệ' });
    }

    try {
        // Truy vấn trực tiếp bằng trường paymentSession mà bạn đã gửi từ Frontend
        const transactions = await Transaction.find({ paymentSession: id })
            .populate('household') // Lấy thông tin căn hộ (số phòng, chủ hộ)
            .populate('createdBy', 'name') // Lấy tên người tạo giao dịch
            .sort({ createdAt: -1 }); // Hiện giao dịch mới nhất lên đầu

        // Debug để kiểm tra dữ liệu thực tế tại Server
        console.log(`Tìm thấy ${transactions.length} giao dịch cho session: ${id}`);

        res.status(200).json(transactions);
    } catch (error) {
        console.error("Lỗi Controller:", error);
        res.status(500).json({ 
            message: 'Lỗi khi lấy danh sách giao dịch', 
            error: error.message 
        });
    }
};

// @desc    Xóa một nhân khẩu
// @route   DELETE /payments/sessions/:id/transactions
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: "Không tìm thấy nhân khẩu để xóa" });
        }

        res.status(200).json({ message: "Đã xóa nhân khẩu thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getTransactions,
    createTransaction,
    editTransaction,
    deleteTransaction,
    getTransactionsBySession
};