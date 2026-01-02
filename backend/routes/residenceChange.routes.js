const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { createResidenceChange, getResidenceChanges, updateResidenceChange, deleteResidenceChange } = require('../controllers/residenceChange.controller');

router.route('/')
    .post(protect, createResidenceChange)
    .get(protect, getResidenceChanges);

router.route('/:id')
    .put(protect, updateResidenceChange)
    .delete(protect, deleteResidenceChange);

module.exports = router;