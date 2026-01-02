const ResidenceChange = require('../models/residenceChange');
const Resident = require('../models/resident');
const Household = require('../models/household');

// @desc    Tạo mới khai báo biến đổi nhân khẩu
// @route   POST /api/residence-changes
const createResidenceChange = async (req, res) => {
    try {
        const { residentId, changeType, startDate, endDate, householdId, destination, note } = req.body;

        // 1. Validate cơ bản
        if (!residentId || !changeType || !startDate) {
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc" });
        }

        // 2. Tạo bản ghi biến đổi
        const residenceChange = new ResidenceChange({
            resident: residentId,
            changeType,
            startDate,
            endDate,
            household: householdId,
            destination,
            note
        });

        await residenceChange.save();

        // 3. Cập nhật trạng thái cho Resident
        const updateData = { status: changeType };

        // Logic bổ sung: Nếu là Tạm trú và người dùng chọn căn hộ khác -> Chuyển nhân khẩu sang căn hộ đó
        if (changeType === 'temporary_residence' && householdId) {
            const resident = await Resident.findById(residentId);
            
            // Nếu resident đang ở hộ khác với hộ tạm trú mới
            if (resident && resident.household && resident.household.toString() !== householdId) {
                // Xóa khỏi hộ cũ
                await Household.findByIdAndUpdate(resident.household, {
                    $pull: { members: residentId }
                });
                
                // Thêm vào hộ mới
                await Household.findByIdAndUpdate(householdId, {
                    $push: { members: residentId }
                });

                // Cập nhật reference trong Resident
                updateData.household = householdId;
            }
        }

        await Resident.findByIdAndUpdate(residentId, updateData);

        res.status(201).json(residenceChange);
    } catch (error) {
        console.error("Lỗi khi tạo biến đổi nhân khẩu:", error);
        res.status(500).json({ message: error.message });
    }
};

const getResidenceChanges = async (req, res) => {
    try {
        const changes = await ResidenceChange.find({})
            .populate({
                path: 'resident',
                populate: { path: 'household', select: 'apartmentNumber' }
            })
            .populate('household', 'apartmentNumber')
            .sort({ createdAt: -1 });
        res.status(200).json(changes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateResidenceChange = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedChange = await ResidenceChange.findByIdAndUpdate(id, req.body, { new: true });
        
        // Nếu loại biến đổi thay đổi, cập nhật lại trạng thái nhân khẩu
        if (updatedChange && req.body.changeType) {
             await Resident.findByIdAndUpdate(updatedChange.resident, { status: req.body.changeType });
        }

        res.status(200).json(updatedChange);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteResidenceChange = async (req, res) => {
    try {
        const { id } = req.params;
        await ResidenceChange.findByIdAndDelete(id);
        res.status(200).json({ message: "Đã xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createResidenceChange, getResidenceChanges, updateResidenceChange, deleteResidenceChange };