const { query, get, run } = require('../database/db');
const { generateVisitorId } = require('../utils/visitorIdGenerator');

/**
 * Register a new visitor
 */
async function registerVisitor(req, res, next) {
  try {
    const {
      full_name,
      phone,
      email,
      company,
      person_to_meet,
      employee_id,
      purpose,
      number_of_visitors,
      id_proof_type,
      id_proof_number,
      visit_date,
      expected_arrival,
      expected_departure,
      notes,
      auto_check_in,
    } = req.body;

    // Validation
    if (!full_name || !phone || !person_to_meet || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Phone Number, Person to Meet, and Purpose are required.',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalVisitDate = visit_date || todayStr;
    const visitorId = generateVisitorId();

    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const initialStatus = auto_check_in ? 'Checked In' : 'Expected';
    const checkInTime = auto_check_in ? nowIso : null;

    const result = run(
      `INSERT INTO visitors (
        visitor_id, full_name, phone, email, company, person_to_meet, employee_id,
        purpose, number_of_visitors, id_proof_type, id_proof_number, visit_date,
        expected_arrival, expected_departure, check_in_time, check_out_time, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        visitorId,
        full_name.trim(),
        phone.trim(),
        email ? email.trim() : null,
        company ? company.trim() : 'Independent / Guest',
        person_to_meet.trim(),
        employee_id ? parseInt(employee_id, 10) : null,
        purpose.trim(),
        number_of_visitors ? parseInt(number_of_visitors, 10) : 1,
        id_proof_type || 'National ID',
        id_proof_number ? id_proof_number.trim() : 'N/A',
        finalVisitDate,
        expected_arrival || null,
        expected_departure || null,
        checkInTime,
        null,
        initialStatus,
        notes || null,
      ]
    );

    const createdVisitor = get('SELECT * FROM visitors WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: auto_check_in
        ? 'Visitor registered and checked in successfully!'
        : 'Visitor registration completed successfully!',
      visitor: createdVisitor,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get visitors with search, filter, and pagination
 */
async function getVisitors(req, res, next) {
  try {
    const {
      search,
      status,
      date,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        '(full_name LIKE ? OR visitor_id LIKE ? OR phone LIKE ? OR company LIKE ? OR person_to_meet LIKE ? OR purpose LIKE ?)'
      );
      params.push(term, term, term, term, term, term);
    }

    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (date) {
      if (date === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        conditions.push('visit_date = ?');
        params.push(todayStr);
      } else {
        conditions.push('visit_date = ?');
        params.push(date);
      }
    } else if (startDate && endDate) {
      conditions.push('visit_date BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM visitors ${whereClause}`;
    const totalRow = get(countSql, params);
    const total = totalRow ? totalRow.total : 0;

    // Allowed sort columns
    const allowedSort = ['id', 'visitor_id', 'full_name', 'visit_date', 'check_in_time', 'check_out_time', 'status', 'created_at'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const sql = `
      SELECT * FROM visitors
      ${whereClause}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const visitors = query(sql, [...params, limitNum, offset]);

    res.json({
      success: true,
      visitors,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get currently inside visitors (status = 'Checked In')
 */
async function getCurrentlyInside(req, res, next) {
  try {
    const visitors = query(
      `SELECT * FROM visitors 
       WHERE status = 'Checked In' 
       ORDER BY check_in_time DESC`
    );

    res.json({
      success: true,
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get visitor by ID (numeric id or string visitor_id)
 */
async function getVisitorById(req, res, next) {
  try {
    const { id } = req.params;
    let visitor = null;

    if (!isNaN(id)) {
      visitor = get('SELECT * FROM visitors WHERE id = ?', [id]);
    }

    if (!visitor) {
      visitor = get('SELECT * FROM visitors WHERE visitor_id = ?', [id]);
    }

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: `Visitor not found with ID: ${id}`,
      });
    }

    res.json({
      success: true,
      visitor,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check-in a visitor
 */
async function checkInVisitor(req, res, next) {
  try {
    const { id } = req.params;
    let visitor = !isNaN(id)
      ? get('SELECT * FROM visitors WHERE id = ?', [id])
      : get('SELECT * FROM visitors WHERE visitor_id = ?', [id]);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor record not found.',
      });
    }

    // Prevent duplicate check-in
    if (visitor.status === 'Checked In') {
      return res.status(400).json({
        success: false,
        message: `Visitor ${visitor.full_name} (${visitor.visitor_id}) is ALREADY checked in since ${visitor.check_in_time}.`,
      });
    }

    if (visitor.status === 'Checked Out') {
      return res.status(400).json({
        success: false,
        message: `Visitor ${visitor.full_name} has already checked out. Please register a new visit pass.`,
      });
    }

    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    run(
      `UPDATE visitors 
       SET status = 'Checked In', check_in_time = ? 
       WHERE id = ?`,
      [nowIso, visitor.id]
    );

    const updated = get('SELECT * FROM visitors WHERE id = ?', [visitor.id]);

    res.json({
      success: true,
      message: `Visitor ${visitor.full_name} has been successfully checked in!`,
      visitor: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check-out a visitor
 */
async function checkOutVisitor(req, res, next) {
  try {
    const { id } = req.params;
    let visitor = !isNaN(id)
      ? get('SELECT * FROM visitors WHERE id = ?', [id])
      : get('SELECT * FROM visitors WHERE visitor_id = ?', [id]);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor record not found.',
      });
    }

    if (visitor.status !== 'Checked In') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out: visitor status is currently '${visitor.status}'. Only checked-in visitors can check out.`,
      });
    }

    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    run(
      `UPDATE visitors 
       SET status = 'Checked Out', check_out_time = ? 
       WHERE id = ?`,
      [nowIso, visitor.id]
    );

    const updated = get('SELECT * FROM visitors WHERE id = ?', [visitor.id]);

    res.json({
      success: true,
      message: `Visitor ${visitor.full_name} has been checked out successfully!`,
      visitor: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update visitor details
 */
async function updateVisitor(req, res, next) {
  try {
    const { id } = req.params;
    const existing = !isNaN(id)
      ? get('SELECT * FROM visitors WHERE id = ?', [id])
      : get('SELECT * FROM visitors WHERE visitor_id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Visitor record not found.',
      });
    }

    const {
      full_name,
      phone,
      email,
      company,
      person_to_meet,
      employee_id,
      purpose,
      number_of_visitors,
      id_proof_type,
      id_proof_number,
      visit_date,
      expected_arrival,
      expected_departure,
      status,
      notes,
    } = req.body;

    run(
      `UPDATE visitors SET
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        company = COALESCE(?, company),
        person_to_meet = COALESCE(?, person_to_meet),
        employee_id = COALESCE(?, employee_id),
        purpose = COALESCE(?, purpose),
        number_of_visitors = COALESCE(?, number_of_visitors),
        id_proof_type = COALESCE(?, id_proof_type),
        id_proof_number = COALESCE(?, id_proof_number),
        visit_date = COALESCE(?, visit_date),
        expected_arrival = COALESCE(?, expected_arrival),
        expected_departure = COALESCE(?, expected_departure),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
      WHERE id = ?`,
      [
        full_name,
        phone,
        email,
        company,
        person_to_meet,
        employee_id,
        purpose,
        number_of_visitors,
        id_proof_type,
        id_proof_number,
        visit_date,
        expected_arrival,
        expected_departure,
        status,
        notes,
        existing.id,
      ]
    );

    const updated = get('SELECT * FROM visitors WHERE id = ?', [existing.id]);

    res.json({
      success: true,
      message: 'Visitor updated successfully!',
      visitor: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a visitor record (Admin only)
 */
async function deleteVisitor(req, res, next) {
  try {
    const { id } = req.params;
    const existing = !isNaN(id)
      ? get('SELECT * FROM visitors WHERE id = ?', [id])
      : get('SELECT * FROM visitors WHERE visitor_id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Visitor record not found.',
      });
    }

    run('DELETE FROM visitors WHERE id = ?', [existing.id]);

    res.json({
      success: true,
      message: `Visitor record ${existing.visitor_id} (${existing.full_name}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerVisitor,
  getVisitors,
  getCurrentlyInside,
  getVisitorById,
  checkInVisitor,
  checkOutVisitor,
  updateVisitor,
  deleteVisitor,
};
