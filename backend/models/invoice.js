// # Model Hóa đơn (Khoản phải thu cho từng hộ)
const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
    paymentSession: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentSession', required: true },
    fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
    
    // Số tiền phải đóng (Được tính toán tự động khi tạo hóa đơn)
    amount: { type: Number, required: true },
    
    // Số tiền đã đóng (để theo dõi đóng thiếu/đủ)
    paidAmount: { type: Number, default: 0 },
    
    status: { type: String, enum: ['unpaid', 'paid', 'partial'], default: 'unpaid' },
    dueDate: { type: Date } // Hạn nộp (thường lấy theo PaymentSession.endDate)
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);