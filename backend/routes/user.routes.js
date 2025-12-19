const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser 
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/users - Get all users
// @route   POST /api/users - Create new user
// @access  Private (Admin only)
router.route('/')
    .get(protect, getUsers)
    .post(protect, createUser);

// @route   GET /api/users/:id - Get user by ID
// @route   PUT /api/users/:id - Update user
// @route   DELETE /api/users/:id - Delete user
// @access  Private (Admin only)
router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, deleteUser);

module.exports = router;
