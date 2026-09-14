const express = require('express');
const router = express.Router();
const { getReports, exportVisitorsCSV } = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, requireRole('admin', 'security'), getReports);
router.get('/export/csv', authenticateToken, requireRole('admin', 'security'), exportVisitorsCSV);

module.exports = router;
