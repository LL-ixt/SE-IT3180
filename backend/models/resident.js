// # Model Nhân khẩu (Thông tin cá nhân, CCCD)
const mongoose = require('mongoose');

const residentSchema = mongoose.Schema({
	fullName: { type: String, required: true },
	idNumber: { type: String, required: true }, // CCCD/ID
	dob: { type: Date },
	gender: { type: String, enum: ['male', 'female', 'other'] },
	relationToOwner: { type: String, required: true, enum: ['owner', 'spouse', 'child', 'parent', 'sibling', 'relative', 'renter', 'other'] }, // Mối quan hệ với chủ hộ
	phone: { type: String },
	email: { type: String },
	status: { type: String, enum: ['permanent', 'temporary_residence', 'temporary_absence'], default: 'permanent' },
	household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);