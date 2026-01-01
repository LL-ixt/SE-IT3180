const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { createResidenceChange, getResidenceChanges } = require('../controllers/residenceChange.controller');

router.route('/')
    .post(protect, createResidenceChange)
    .get(protect, getResidenceChanges);

module.exports = router;