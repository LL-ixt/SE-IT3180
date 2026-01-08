const PaymentSession = require('../models/paymentSession');
const Fee = require('../models/fee');
const mongoose = require('mongoose');
const Invoice = require('../models/invoice');
const Transaction = require('../models/transaction');
const invoiceService = require('../services/invoice.service');
const Household = require('../models/household');
const HouseholdPaymentDetail = require('../models/householdPaymentDetail');
// Helper function to check for valid ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- PAYMENT SESSION (Đợt thu - UC006, UC007) ---

// @desc      Get all payment sessions
// @route     GET /api/payments/sessions
// @access    Private
const getPaymentSessions = async (req, res) => {
    try {
        const now = new Date();
        await PaymentSession.updateMany(
            {
                $or: [
                    { endDate: { $lt: now } }    // Đã quá hạn
                ]
            },
            { $set: { isActive: false } }
        );
        await PaymentSession.updateMany(
            {
                startDate: { $lte: now },
                endDate: { $gte: now }
            },
            { $set: { isActive: true } }
        );
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

const syncHouseholdPayments = async (session) => {
    const households = await Household.find({});
    
    // 1. Lấy danh sách chi tiết hiện tại của session này
    const currentDetails = await HouseholdPaymentDetail.find({ paymentSession: session._id });

    // 2. Chuẩn bị cấu trúc items chuẩn từ session mới nhất
    const sessionFeeConfigs = session.fees.map(f => ({
        feeInSessionId: f._id.toString(),
        feeName: f.fee.name, 
        feeType: f.fee.type,
        unit: f.fee.unit,
        unitPrice: f.unitPrice
    }));

    const ops = households.map(h => {
        // Tìm bản ghi hiện tại của hộ này
        const existingDoc = currentDetails.find(d => d.household.toString() === h._id.toString());
        
        let updatedItems = [];

        if (existingDoc) {
            // MERGE LOGIC: So khớp items cũ và cấu trúc session mới
            updatedItems = sessionFeeConfigs.map(config => {
                const oldItem = existingDoc.items.find(
                    item => item.feeInSessionId.toString() === config.feeInSessionId
                );

                if (oldItem) {
                    // Nếu đã có: giữ nguyên quantity, isPaid... nhưng cập nhật unitPrice/name/type mới
                    return {
                        ...oldItem.toObject(),
                        feeName: config.feeName,
                        feeType: config.feeType,
                        unit: config.unit,
                        unitPrice: config.unitPrice,
                        // Quan trọng: recalculate totalAmount dựa trên quantity cũ và giá mới
                        totalAmount: (oldItem.quantity || 0) * config.unitPrice 
                    };
                } else {
                    // Nếu là cột phí mới thêm vào session: khởi tạo mặc định
                    return {
                        ...config,
                        quantity: 0,
                        totalAmount: 0,
                        paidAmount: 0,
                        isPaid: false
                    };
                }
            });
        } else {
            // Nếu là hộ dân mới hoàn toàn: khởi tạo items từ đầu
            updatedItems = sessionFeeConfigs.map(config => ({
                ...config,
                quantity: 0,
                totalAmount: 0,
                paidAmount: 0,
                isPaid: false
            }));
        }

        return {
            updateOne: {
                filter: { paymentSession: session._id, household: h._id },
                update: { $set: { items: updatedItems } },
                upsert: true
            }
        };
    });

    if (ops.length > 0) {
        await HouseholdPaymentDetail.bulkWrite(ops);
    }
};

// @desc      Update payment session
// @route     PUT /api/payments/sessions/:id
// @access    Private
const editPaymentSession = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Invalid Session ID format' });
    }

    try {
        // 1. Tìm session cũ để so sánh trước khi update
        const oldSession = await PaymentSession.findById(id);
        if (!oldSession) {
            return res.status(404).json({ message: 'Payment Session not found' });
        }

        // 2. Kiểm tra xem có thay đổi những trường quan trọng không
        // (startDate, endDate, hoặc danh sách fees)
        const isCriticalUpdate = 
            (updateData.startDate && new Date(updateData.startDate).getTime() !== oldSession.startDate.getTime()) ||
            (updateData.endDate && new Date(updateData.endDate).getTime() !== oldSession.endDate.getTime()) ||
            (updateData.fees); // Nếu có mảng fees mới

        // 3. Thực hiện cập nhật
        const updatedSession = await PaymentSession.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate({
            path: 'fees.fee',
            select: 'name type unit'
        });

        // 4. Chỉ đồng bộ lại bảng thu nếu có thay đổi quan trọng
        if (isCriticalUpdate) {
            console.log("Phát hiện thay đổi về ngày hoặc phí. Bắt đầu đồng bộ lại...");
            await syncHouseholdPayments(updatedSession);
        }

        res.status(200).json(updatedSession);
    } catch (error) {
        console.error("Lỗi cập nhật phiên thu:", error);
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

// @desc      Get all household payment details (Excel rows) for a session
// @route     GET /api/paymentSessions/:id/details
// @access    Private
const getPaymentDetails = async (req, res) => {
    const { id } = req.params; // ID của PaymentSession

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Định dạng Session ID không hợp lệ' });
    }

    try {
        // Tìm tất cả các dòng dữ liệu (mỗi dòng là 1 hộ) thuộc đợt thu này
        const details = await HouseholdPaymentDetail.find({ paymentSession: id })
            .populate('household', 'apartmentNumber ownerName') // Lấy thông tin căn hộ để hiển thị
            .sort({ 'household.apartmentNumber': 1 }); // Sắp xếp theo số phòng cho dễ nhìn

        // Nếu chưa có bản ghi nào (có thể do chưa chạy hàm đồng bộ), trả về mảng rỗng
        res.status(200).json(details);
    } catch (error) {
        console.error("Lỗi getPaymentDetails:", error);
        res.status(500).json({ 
            message: 'Lỗi khi tải chi tiết bảng thu', 
            error: error.message 
        });
    }
};

// File: controllers/paymentSession.controller.js
// Tại paymentSession.controller.js
const updateColumnQuantity = async (req, res) => {
    const { id: sessionId, feeId: feeInSessionId } = req.params;
    const { updates } = req.body;

    try {
        const bulkOps = updates.map(upd => {
            const qty = Number(upd.quantity) || 0;
            
            // Logic: Nếu là phí tự nguyện và có nhập tiền (>0), set luôn isPaid = true
            const updateFields = { "items.$.quantity": qty };
            
            // Tìm loại phí để biết có phải tự nguyện không
            // Tuy nhiên bulkWrite khó check điều kiện này, nên ta sẽ xử lý trong vòng lặp save() phía dưới
            return {
                updateOne: {
                    filter: { paymentSession: sessionId, household: upd.householdId, "items.feeInSessionId": feeInSessionId },
                    update: { $set: updateFields }
                }
            };
        });

        await HouseholdPaymentDetail.bulkWrite(bulkOps);

        // Sau khi bulkWrite, ta load lại để chạy Middleware pre('save')
        const docs = await HouseholdPaymentDetail.find({ paymentSession: sessionId });
        for (const doc of docs) {
            // Duyệt qua các item vừa cập nhật để set isPaid cho phí tự nguyện
            doc.items.forEach(item => {
                if (item.feeInSessionId.toString() === feeInSessionId && item.feeType === 'voluntary') {
                    if (item.quantity > 0) {
                        item.isPaid = true;
                        item.paidAmount = item.quantity; // Với phí tự nguyện, totalAmount = quantity
                    } else {
                        item.quantity = 0;
                        item.isPaid = false;
                        item.paidAmount = 0;
                    }
                }
            });
            await doc.save();
        }

        res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleFeePayment = async (req, res) => {
    const { id: detailId } = req.params; // ID của bản ghi HouseholdPaymentDetail
    const { feeInSessionId, mode } = req.body; 

    try {
        const detail = await HouseholdPaymentDetail.findById(detailId);
        if (!detail) return res.status(404).json({ message: "Không tìm thấy bản ghi" });

        if (mode === 'ALL_MANDATORY') {
            // Duyệt qua tất cả các mục phí bắt buộc và đánh dấu đã nộp
            detail.items.forEach(item => {
                if (item.feeType !== 'voluntary') {
                    item.isPaid = true;
                    item.paidAmount = item.totalAmount;
                }
            });
        } else {
            // Tìm đúng ô phí được click để toggle
            const item = detail.items.find(i => i.feeInSessionId.toString() === feeInSessionId);
            if (item) {
                // Đảo trạng thái: Nếu đang xanh (paid) thì thành trắng (unpaid) và ngược lại
                item.isPaid = !item.isPaid;
                item.paidAmount = item.isPaid ? item.totalAmount : 0;
            }
        }
        detail.markModified('items');
        // Middleware pre('save') sẽ tự động tính lại tổng tiền đã nộp và trạng thái
        await detail.save();
        res.status(200).json(detail);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const calculateAutoFees = async (req, res) => {
    const { id: sessionId } = req.params;

    try {
        // 1. Lấy tất cả chi tiết bảng thu của đợt này và populate thông tin hộ dân
        const details = await HouseholdPaymentDetail.find({ paymentSession: sessionId })
            .populate('household');

        if (!details.length) {
            return res.status(404).json({ message: "Chưa có dữ liệu chi tiết để tính toán" });
        }

        // 2. Lặp qua từng hộ dân để tính toán các khoản phí tự động
        for (const doc of details) {
            const household = doc.household;
            //console.log(household);
            doc.items.forEach(item => {
                console.log("item: ", item);
                // Chỉ tính toán cho các loại phí có type là 'mandatory_automatic'
                if (household.status === 'inactive') item.quantity = 0;
                else if (item.feeType === 'mandatory_automatic') {
                    // Logic tính toán quantity dựa trên đơn vị (unit)
                    // Giả sử unit được lưu trong item hoặc lấy từ Fee gốc
                    switch (item.unit) {
                        case 'area':
                            item.quantity = household.area || 0;
                            break;
                        case 'bike':
                            item.quantity = household.motorbikeNumber || 0;
                            break;
                        case 'car':
                            item.quantity = household.carNumber || 0;
                            break;
                        case 'person':
                            item.quantity = household.members ? household.members.length : 0;
                            break;
                        default:
                            item.quantity = 1;
                            break;
                    }
                    // totalAmount sẽ được Middleware pre('save') tính toán lại: quantity * unitPrice
                }
            });

            // 3. Lưu bản ghi để kích hoạt middleware tính tổng tiền và trạng thái
            await doc.save();
        }

        res.status(200).json({ message: "Tính toán phí tự động hoàn tất" });
    } catch (error) {
        console.error("Lỗi calculateAutoFees:", error);
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getPaymentSessions,
    createPaymentSession,
    editPaymentSession,
    deletePaymentSession,
    deleteFeeInPaymentSession,
    getInvoicesBySession,
    updateInvoicesForFee,
    getPaymentDetails,
    updateColumnQuantity,
    toggleFeePayment,
    calculateAutoFees
};