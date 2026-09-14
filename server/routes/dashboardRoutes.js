const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/stats', authenticateToken, requireRole('admin', 'security'), getDashboardStats);

module.exports = router;
