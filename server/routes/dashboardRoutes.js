const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getDashboardStats);
router.get('/backup-plan', dashboardController.getBackupPlan);
router.post('/backup-plan', dashboardController.updateBackupPlan);
router.post('/backup-now', dashboardController.backupNow);

module.exports = router;
