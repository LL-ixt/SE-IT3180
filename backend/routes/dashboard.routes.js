const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');

// Định nghĩa đường dẫn: GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

module.exports = router;