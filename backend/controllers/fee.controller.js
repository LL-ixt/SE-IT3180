const Fee = require('../models/fee');
const mongoose = require('mongoose');

// @desc      Get all fees
// @route     GET /api/fees
// @access    Private
const getFees = async (req, res) => {
    try {
        const fees = await Fee.find({});
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fees', error: error.message });
    }
};

// @desc      Create new fee
// @route     POST /api/fees
// @access    Private (Admin/Manager role typically)
const createFee = async (req, res) => {
    const { name, type, unitPrice, unit, description } = req.body;

    try {
        // Check if a fee with the same name already exists
        const existingFee = await Fee.findOne({ name });
        if (existingFee) {
            return res.status(400).json({ message: 'A fee with this name already exists.' });
        }

        const fee = new Fee({
            name,
            type,
            unitPrice: type === 'mandatory_automatic' ? unitPrice : undefined,
            unit: type === 'mandatory_automatic' ? unit : undefined,
            description
        });

        const createdFee = await fee.save();
        res.status(201).json(createdFee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating fee', error: error.message });
    }
};

// @desc      Update existing fee
// @route     PUT /api/fees/:id
// @access    Private (Admin/Manager role typically)
const editFee = async (req, res) => {
    const { id } = req.params;
    const { name, type, unitPrice, unit, description } = req.body;

    // Optional: Check if the ID is valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Fee ID format' });
    }

    try {
        const fee = await Fee.findById(id);

        if (fee) {
            // Update fields only if they are provided in the request body
            fee.name = name || fee.name;
            fee.type = type || fee.type;
            fee.unitPrice = unitPrice !== undefined ? unitPrice : fee.unitPrice;
            fee.unit = unit || fee.unit;
            fee.description = description !== undefined ? description : fee.description;

            const updatedFee = await fee.save();
            res.status(200).json(updatedFee);
        } else {
            res.status(404).json({ message: 'Fee not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating fee', error: error.message });
    }
};

// @desc      Delete a fee
// @route     DELETE /api/fees/:id
// @access    Private (Admin/Manager role typically)
const deleteFee = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Fee ID format' });
    }

    try {
        const fee = await Fee.findById(id);

        if (fee) {
            // NOTE: In a real system, you would check if this fee is linked to any active PaymentSession or Transaction
            // If linked, deletion should be prevented or soft-deleted. 
            await Fee.deleteOne({ _id: id });
            res.status(200).json({ message: 'Fee successfully removed' });
        } else {
            res.status(404).json({ message: 'Fee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting fee', error: error.message });
    }
};

module.exports = {
    getFees,
    createFee,
    editFee,
    deleteFee
};