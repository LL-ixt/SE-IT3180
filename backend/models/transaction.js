// # Model Giao dịch nộp tiền (Ai nộp, nộp khoản nào, ngày nộp)
const mongoose = require('mongoose');
const paymentSession = require('./paymentSession');

const transactionSchema = mongoose.Schema({
	household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
	//BỎ VÌ 1 GIAO DỊCH CÓ THỂ THANH TOÁN TẤT CẢ KHOẢN PHÍ
	//fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee' },
    // Reference to the specific Invoice being paid
    //invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
	paymentSession: {type: mongoose.Schema.Types.ObjectId, ref: 'PaymentSession', required: true},
	amount: { type: Number, required: true },
	date: { type: Date, default: Date.now },
	payerName: { type: String },
	method: { type: String, enum: ['cash', 'bank', 'other'], default: 'cash' },
	note: { type: String },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	status: {
		type: String, enum: ['checked', 'unchecked'], default: 'checked'
	}
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);