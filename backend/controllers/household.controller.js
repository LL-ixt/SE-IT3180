const Household = require('../models/household');
const Resident = require('../models/residents');
// @desc    Get all households
// @route   GET /api/households
//PHIÊN BẢN ĐẦU: GỌI TẤT CẢ CÁC HOUSEHOLD CÙNG VỚI MEMBER
//DỰ KIẾN: KHI LOAD TRANG KHÔNG CẦN GỌI MEMBER, MÀ SẼ GỌI KHI BẤM NÚT CHI TIẾT
const getHouseholds = async (req, res) => {
    try {
        const households = await Household.find().populate('members');
        res.json(households);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new household
// @route   POST /api/households
const createHousehold = async (req, res) => {
    const { apartmentNumber, area, ownerName, motorbikeNumber, carNumber, status } = req.body;
    try {
        const household = new Household({ apartmentNumber, area, ownerName, motorbikeNumber, carNumber, status });
        const createdHousehold = await household.save();
        res.status(201).json(createdHousehold);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a household
// @route   DELETE /api/households/:id
const deleteHousehold = async (req, res) => {
    try {
        // 1. Tìm và xóa hộ khẩu trực tiếp
        const household = await Household.findByIdAndDelete(req.params.id);

        // 2. Kiểm tra nếu không tìm thấy ID
        if (!household) {
            return res.status(404).json({ message: "Household not found" });
        }

        // 3. Trả về thông báo thành công (Status 200)
        res.status(200).json({ 
            message: "Household deleted successfully",
            deletedHousehold: household 
        });
    } catch (error) {
        // 4. Lỗi server hoặc ID không đúng định dạng ObjectId
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a household
// @route   PUT /api/households/:id
const updateHousehold = async (req, res) => {
    try {
        // 1. Tìm và cập nhật hộ khẩu bằng findByIdAndUpdate
        // { new: true }: Trả về object sau khi đã cập nhật thay vì object cũ
        // { runValidators: true }: Đảm bảo dữ liệu mới vẫn tuân thủ Schema (vd: required, enum)
        const updatedHousehold = await Household.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // 2. Kiểm tra nếu không tìm thấy hộ khẩu với ID cung cấp
        if (!updatedHousehold) {
            return res.status(404).json({ message: "Không tìm thấy hộ khẩu để cập nhật" });
        }

        // 3. Trả về dữ liệu đã cập nhật thành công (Status 200)
        res.status(200).json(updatedHousehold);
        
    } catch (error) {
        // 4. Xử lý lỗi (ví dụ: lỗi định dạng ID hoặc lỗi từ Database)
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getHouseholds, createHousehold, deleteHousehold, updateHousehold };