const mongoose = require('mongoose');

const residenceChangeSchema = mongoose.Schema({
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
    changeType: { 
        type: String, 
        enum: ['temporary_residence', 'temporary_absence'], 
        required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Thời hạn
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' }, // Tham chiếu căn hộ (đối với tạm trú)
    destination: { type: String }, // Địa chỉ nơi đến (đối với tạm vắng)
    note: { type: String } // Lý do / Ghi chú
}, { timestamps: true });

module.exports = mongoose.model('ResidenceChange', residenceChangeSchema);