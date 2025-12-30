const mongoose = require('mongoose');

const householdPaymentDetailSchema = mongoose.Schema({
    // 1. LIÊN KẾT ĐỢT THU & CĂN HỘ (Định danh dòng trong Excel)
    paymentSession: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PaymentSession', 
        required: true 
    },
    household: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Household', 
        required: true 
    },

    // 2. DANH SÁCH CÁC KHOẢN PHÍ (Các cột trong Excel)
    items: [
        {
            // Liên kết với bản ghi phí cụ thể TRONG PaymentSession (đã bị override)
            // Đây chính là cái _id (ví dụ: 694fa24d...) bạn thấy trong log
            feeInSessionId: { 
                type: mongoose.Schema.Types.ObjectId, 
                required: true 
            },
            
            // Tham chiếu đến Fee gốc để lấy icon, phân loại (Bắt buộc/Tự nguyện)
            feeRef: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Fee' 
            },

            feeType: {       // THÊM MỚI: Snapshot loại phí (mandatory_automatic, mandatory_manual, voluntary)
                type: String,
                enum: ['mandatory_automatic', 'mandatory_manual', 'voluntary']
            },
            feeName: String, // Snapshot tên phí để xem nhanh

            // Dữ liệu tài chính
            unitPrice: { type: Number, required: true }, // Giá đã ghi đè từ Session
            quantity: { type: Number, default: 0 },      // Số lượng (m2, số điện, số người...)
            totalAmount: { type: Number, default: 0 },   // unitPrice * quantity

            isPaid: { type: Boolean, default: false }
        }
    ],

    // 3. TỔNG CỘNG TOÀN BỘ CĂN HỘ (Cột tổng kết ở cuối bảng Excel)
    totalBill: { type: Number, default: 0 }, // Tổng phải đóng của tất cả items
    totalPaidAmount: { type: Number, default: 0 }, // Tổng đã đóng
    
    status: { 
        type: String, 
        enum: ['unpaid', 'partially_paid', 'paid'], 
        default: 'unpaid' 
    },

    note: { type: String } // Ghi chú riêng cho căn hộ này trong đợt thu
}, { timestamps: true });

// // Middleware tự động tính tổng tiền trước khi lưu
// householdPaymentDetailSchema.pre('save', function(next) {
//     this.totalBill = this.items.reduce((sum, item) => {
//         item.totalAmount = item.unitPrice * item.quantity;
//         return sum + item.totalAmount;
//     }, 0);
    
//     this.totalPaidAmount = this.items.reduce((sum, item) => sum + item.paidAmount, 0);
    
//     // Tự động cập nhật trạng thái thanh toán
//     if (this.totalPaidAmount === 0) this.status = 'unpaid';
//     else if (this.totalPaidAmount >= this.totalBill) this.status = 'paid';
//     else this.status = 'partially_paid';

//     next();
// });

householdPaymentDetailSchema.pre('save', function () {
    this.items.forEach(item => {
        if (!item.unitPrice || item.unitPrice === 0) {
            item.totalAmount = item.quantity;
        } else {
            item.totalAmount = item.quantity * item.unitPrice;
        }
    });

    this.totalBill = this.items
        .filter(item => item.feeType !== 'voluntary')
        .reduce((sum, item) => sum + item.totalAmount, 0);
    this.totalPaidAmount = this.items.filter(item => item.feeType !== 'voluntary').reduce((sum, item) => sum + item.paidAmount, 0);

    if (this.totalPaidAmount === 0 && this.totalBill > 0) {
        this.status = 'unpaid';
    } else if (this.totalPaidAmount >= this.totalBill && this.totalBill > 0) {
        this.status = 'paid';
    } else if (this.totalPaidAmount > 0) {
        this.status = 'partially_paid';
    } else {
        this.status = 'unpaid';
    }
});

module.exports = mongoose.model('HouseholdPaymentDetail', householdPaymentDetailSchema);