const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  deleteUser,
  getSettings,
  updateSettings,
} = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Staff management (Admin only)
router.get('/', authenticateToken, requireRole('admin'), getUsers);
router.post('/', authenticateToken, requireRole('admin'), createUser);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);

// Settings
router.get('/settings', getSettings);
router.put('/settings', authenticateToken, requireRole('admin'), updateSettings);

module.exports = router;
