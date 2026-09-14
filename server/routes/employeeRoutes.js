const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Allow fetching employee directory (for visitor registration form "Person to Meet" dropdown)
router.get('/', getEmployees);
router.get('/:id', authenticateToken, getEmployeeById);

// Admin-only management endpoints
router.post('/', authenticateToken, requireRole('admin'), createEmployee);
router.put('/:id', authenticateToken, requireRole('admin'), updateEmployee);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteEmployee);

module.exports = router;
