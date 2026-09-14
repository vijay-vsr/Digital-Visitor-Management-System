const bcrypt = require('bcryptjs');
const { query, get, run } = require('../database/db');

/**
 * Get list of staff users (Admin only)
 */
async function getUsers(req, res, next) {
  try {
    const users = query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new user (Admin only)
 */
async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!['admin', 'security'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'admin' or 'security'.",
      });
    }

    const existing = get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash, role]
    );

    const created = get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [
      result.lastInsertRowid,
    ]);

    res.status(201).json({
      success: true,
      message: `${role === 'admin' ? 'Administrator' : 'Security / Reception'} account created!`,
      user: created,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a user (Admin only)
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const targetUser = get('SELECT * FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent deleting the last admin
    if (targetUser.role === 'admin') {
      const adminCount = get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")?.count || 0;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only administrator account.',
        });
      }
    }

    run('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get office settings
 */
async function getSettings(req, res, next) {
  try {
    const rows = query('SELECT key, value FROM settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update office settings
 */
async function updateSettings(req, res, next) {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required.',
      });
    }

    for (const [key, value] of Object.entries(settings)) {
      run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
    }

    res.json({
      success: true,
      message: 'Settings saved successfully!',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  createUser,
  deleteUser,
  getSettings,
  updateSettings,
};
