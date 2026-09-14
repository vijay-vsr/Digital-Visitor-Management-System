const express = require('express');
const router = express.Router();
const {
  registerVisitor,
  getVisitors,
  getCurrentlyInside,
  getVisitorById,
  checkInVisitor,
  checkOutVisitor,
  updateVisitor,
  deleteVisitor,
} = require('../controllers/visitorController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public route: Visitor self-registration or kiosk
router.post('/', registerVisitor);

// Public route: Lookup pass by visitor ID (e.g. for pass verification or kiosk)
router.get('/pass/:id', getVisitorById);

// Protected routes (Admin & Security)
router.get('/inside', authenticateToken, requireRole('admin', 'security'), getCurrentlyInside);
router.get('/', authenticateToken, requireRole('admin', 'security'), getVisitors);
router.get('/:id', authenticateToken, requireRole('admin', 'security'), getVisitorById);
router.post('/:id/checkin', authenticateToken, requireRole('admin', 'security'), checkInVisitor);
router.post('/:id/checkout', authenticateToken, requireRole('admin', 'security'), checkOutVisitor);
router.put('/:id', authenticateToken, requireRole('admin', 'security'), updateVisitor);

// Admin-only route: Delete visitor record
router.delete('/:id', authenticateToken, requireRole('admin'), deleteVisitor);

module.exports = router;
