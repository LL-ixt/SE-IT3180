//# Model Khoản thu (Tên, đơn giá, loại phí)
const mongoose = require('mongoose');

const feeSchema = mongoose.Schema({
    name: { type: String, required: true }, // Tên khoản thu (Vệ sinh, Gửi xe)
    type: { type: String, enum: ['mandatory_automatic', 'mandatory_manual', 'voluntary'], required: true }, // Bắt buộc / Tự nguyện
    unitPrice: { 
        type: Number, 
        required: function() { return this.type === 'mandatory_automatic'; } 
    }, // Đơn giá (Chỉ bắt buộc với loại tự động)
    unit: { 
        type: String, 
        enum: ['area', 'person', 'household', 'fixed'], 
        required: function() { return this.type === 'mandatory_automatic'; } 
    }, // Tính theo (Chỉ bắt buộc với loại tự động)
    description: String
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
