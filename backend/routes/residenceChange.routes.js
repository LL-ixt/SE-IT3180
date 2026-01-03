const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createResidenceChange, getResidenceChanges, updateResidenceChange, deleteResidenceChange } = require('../controllers/residenceChange.controller');

router.use(protect);

router.route('/')
    .post(authorize('admin', 'manager'), createResidenceChange)
    .get(authorize('admin', 'manager', 'accountant'), getResidenceChanges);

router.route('/:id')
    .put(authorize('admin', 'manager'), updateResidenceChange)
    .delete(authorize('admin', 'manager'), deleteResidenceChange);

module.exports = router;