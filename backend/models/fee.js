//# Model Khoản thu (Tên, đơn giá, loại phí)
const mongoose = require('mongoose');

const feeSchema = mongoose.Schema({
    name: { type: String, required: true }, // Tên khoản thu (Vệ sinh, Gửi xe)
    type: { type: String, enum: ['mandatory', 'voluntary'], required: true }, // Bắt buộc / Tự nguyện
    unitPrice: { type: Number, required: true }, // Đơn giá (VD: 6000đ/m2)
    unit: { type: String, enum: ['area', 'person', 'household', 'fixed'], required: true }, // Tính theo: diện tích, người, hộ, cố định
    description: String
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
