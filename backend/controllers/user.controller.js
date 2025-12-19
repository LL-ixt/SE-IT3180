// # UC011-UC013: CRUD Tài khoản cán bộ
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc      Get all users
// @route     GET /api/users
// @access    Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from response
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// @desc      Get user by ID
// @route     GET /api/users/:id
// @access    Private (Admin only)
const getUserById = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid User ID format' });
    }

    try {
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// @desc      Create new user (Add staff account)
// @route     POST /api/users
// @access    Private (Admin only)
// @note      UC011: Thêm tài khoản cán bộ
const createUser = async (req, res) => {
    const { username, password, fullName, role } = req.body;

    // Validation
    if (!username || !password || !fullName || !role) {
        return res.status(400).json({
            message: 'Please fill in all required fields: username, password, fullName, role'
        });
    }

    // Validate role
    if (!['admin', 'manager'].includes(role)) {
        return res.status(400).json({
            message: 'Invalid role. Must be either "admin" or "manager"'
        });
    }

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: `Username "${username}" already exists` });
        }

        // Create new user
        const user = new User({
            username,
            password, // Will be hashed by the pre-save hook
            fullName,
            role
        });

        const createdUser = await user.save();

        // Return user data without password
        const userResponse = {
            _id: createdUser._id,
            username: createdUser.username,
            fullName: createdUser.fullName,
            role: createdUser.role,
            createdAt: createdUser.createdAt,
            updatedAt: createdUser.updatedAt
        };

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
};

// @desc      Update existing user (Modify staff account)
// @route     PUT /api/users/:id
// @access    Private (Admin only)
// @note      UC012: Sửa thông tin tài khoản cán bộ
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, role, password } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid User ID format' });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (fullName) user.fullName = fullName;
        if (role) {
            // Validate role
            if (!['admin', 'manager'].includes(role)) {
                return res.status(400).json({
                    message: 'Invalid role. Must be either "admin" or "manager"'
                });
            }
            user.role = role;
        }
        if (password) user.password = password; // Will be hashed by pre-save hook

        const updatedUser = await user.save();

        // Return user data without password
        const userResponse = {
            _id: updatedUser._id,
            username: updatedUser.username,
            fullName: updatedUser.fullName,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };

        res.status(200).json(userResponse);
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
};

// @desc      Delete user (Remove staff account)
// @route     DELETE /api/users/:id
// @access    Private (Admin only)
// @note      UC013: Xóa tài khoản cán bộ
const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid User ID format' });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deletion of the last admin user (optional check)
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount === 1) {
                return res.status(400).json({
                    message: 'Cannot delete the last admin user. Must have at least one admin.'
                });
            }
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            message: 'User deleted successfully',
            deletedUser: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
