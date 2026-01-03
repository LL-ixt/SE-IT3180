const Household = require('../models/household');
const Resident = require('../models/resident'); // Model nhân khẩu
const PaymentSession = require('../models/paymentSession');
const HouseholdPaymentDetail = require('../models/householdPaymentDetail');

// API lấy số liệu thống kê
const getDashboardStats = async (req, res) => {
    try {
        // 1. Đếm tổng số hộ khẩu (đang hoạt động)
        const totalHouseholds = await Household.countDocuments({ status: 'active' });

        // 2. Đếm tổng nhân khẩu

        const totalResidents = await Resident.countDocuments({});

        // 3. Tính toán tiền từ đợt thu ĐANG HOẠT ĐỘNG (Active)
        const currentSession = await PaymentSession.findOne({ isActive: true }).sort({ startDate: -1 });

        let totalRevenue = 0;   // Tổng tiền thực thu
        let expectedRevenue = 0; // Tổng tiền phải thu (dùng để tính %)
        let paymentRate = 0;

        if (currentSession) {
            const details = await HouseholdPaymentDetail.find({ paymentSession: currentSession._id });

            details.forEach(doc => {
                doc.items.forEach(item => {
                    // Cộng dồn tiền đã thu (Revenue)
                    if (item.paidAmount) totalRevenue += item.paidAmount;

                    // Cộng dồn tiền dự kiến (chỉ tính khoản bắt buộc để tính tỷ lệ hoàn thành cho chuẩn)
                    if (item.feeType !== 'voluntary') {
                        expectedRevenue += (item.quantity * item.unitPrice);
                    }
                });
            });

            // Tính tỷ lệ %
            if (expectedRevenue > 0) {
                paymentRate = Math.round((totalRevenue / expectedRevenue) * 100);
            }
        }

        // Trả về kết quả
        res.status(200).json({
            totalHouseholds,
            totalResidents,
            totalRevenue,
            paymentRate,
            sessionName: currentSession ? currentSession.title : 'Chưa có đợt thu'
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Lỗi lấy số liệu dashboard" });
    }
};

module.exports = { getDashboardStats };