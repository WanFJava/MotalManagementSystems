const express = require('express');
const router = express.Router();
const utilityController = require('../controllers/utilityController');

// Quản lý chỉ số điện nước (UC07)
router.get('/utilities', utilityController.getUtilities);
router.post('/utilities', utilityController.recordUtility);
router.get('/utilities/latest/:roomId', utilityController.getLatestUtility);
router.put('/utilities/:id', utilityController.updateUtility);
router.delete('/utilities/:id', utilityController.deleteUtility);

module.exports = router;
