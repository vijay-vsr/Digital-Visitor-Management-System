const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public route: login
router.post('/login', login);

// Protected route: get current logged in user
router.get('/me', authenticateToken, getMe);

module.exports = router;
