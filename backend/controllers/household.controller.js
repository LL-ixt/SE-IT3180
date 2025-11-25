const Household = require('../models/household');

// @desc    Get all households
// @route   GET /api/households
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
    const { apartmentNumber, area, ownerName } = req.body;
    try {
        const household = new Household({ apartmentNumber, area, ownerName });
        const createdHousehold = await household.save();
        res.status(201).json(createdHousehold);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getHouseholds, createHousehold };