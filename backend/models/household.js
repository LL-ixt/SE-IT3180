// # Model Hộ khẩu (Số nhà, diện tích, chủ hộ)
const mongoose = require('mongoose');

const householdSchema = mongoose.Schema({
    apartmentNumber: { type: String, required: true, unique: true }, // Số phòng
    area: { type: Number, required: true }, // Diện tích (m2)
    ownerName: { type: String, required: true }, // Tên chủ hộ
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resident'
    }],
    motorbikeNumber: { type: Number, default: 0 }, // Số xe máy
    carNumber: { type: Number, default: 0 } // Số ô tô
}, { timestamps: true });

module.exports = mongoose.model('Household', householdSchema);