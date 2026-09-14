const { query, get, run } = require('../database/db');

/**
 * Get all employees with optional search & department filter
 */
async function getEmployees(req, res, next) {
  try {
    const { search, department, activeOnly } = req.query;

    const conditions = [];
    const params = [];

    if (activeOnly === 'true' || activeOnly === '1') {
      conditions.push('is_active = 1');
    }

    if (department && department !== 'All') {
      conditions.push('department = ?');
      params.push(department);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR designation LIKE ? OR department LIKE ?)');
      params.push(term, term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM employees ${whereClause} ORDER BY name ASC`;
    const employees = query(sql, params);

    // Also get distinct departments for filter dropdown
    const departments = query('SELECT DISTINCT department FROM employees ORDER BY department ASC').map(
      (d) => d.department
    );

    res.json({
      success: true,
      count: employees.length,
      employees,
      departments,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single employee by ID
 */
async function getEmployeeById(req, res, next) {
  try {
    const { id } = req.params;
    const employee = get('SELECT * FROM employees WHERE id = ?', [id]);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new employee (Admin only)
 */
async function createEmployee(req, res, next) {
  try {
    const { name, email, phone, department, designation } = req.body;

    if (!name || !email || !phone || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, phone, department, designation) are required.',
      });
    }

    // Check duplicate email
    const existing = get('SELECT id FROM employees WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An employee with email ${email} already exists.`,
      });
    }

    const result = run(
      'INSERT INTO employees (name, email, phone, department, designation) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), phone.trim(), department.trim(), designation.trim()]
    );

    const created = get('SELECT * FROM employees WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Employee added successfully!',
      employee: created,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update employee (Admin only)
 */
async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const existing = get('SELECT * FROM employees WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    const { name, email, phone, department, designation, is_active } = req.body;

    if (email && email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const duplicate = get('SELECT id FROM employees WHERE LOWER(email) = LOWER(?) AND id != ?', [
        email.trim(),
        id,
      ]);
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Email ${email} is already in use by another employee.`,
        });
      }
    }

    run(
      `UPDATE employees SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        department = COALESCE(?, department),
        designation = COALESCE(?, designation),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [
        name ? name.trim() : null,
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        department ? department.trim() : null,
        designation ? designation.trim() : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id,
      ]
    );

    const updated = get('SELECT * FROM employees WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Employee updated successfully!',
      employee: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete employee (Admin only)
 */
async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const existing = get('SELECT * FROM employees WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    run('DELETE FROM employees WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Employee ${existing.name} has been removed.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
