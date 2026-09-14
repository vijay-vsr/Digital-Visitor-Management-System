const { query, get } = require('../database/db');

/**
 * Get comprehensive analytics for the reports dashboard
 */
async function getReports(req, res, next) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Dates for time windows
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Summary counts
    const dailyVisitors = get('SELECT COUNT(*) as count FROM visitors WHERE visit_date = ?', [todayStr])?.count || 0;
    const weeklyVisitors = get('SELECT COUNT(*) as count FROM visitors WHERE visit_date >= ?', [sevenDaysAgo])?.count || 0;
    const monthlyVisitors = get('SELECT COUNT(*) as count FROM visitors WHERE visit_date >= ?', [thirtyDaysAgo])?.count || 0;
    const currentlyInside = get("SELECT COUNT(*) as count FROM visitors WHERE status = 'Checked In'")?.count || 0;
    const allTimeVisitors = get('SELECT COUNT(*) as count FROM visitors')?.count || 0;

    // Most Visited Employees (Top 5)
    const mostVisitedEmployees = query(
      `SELECT person_to_meet, COUNT(*) as visitor_count 
       FROM visitors 
       GROUP BY person_to_meet 
       ORDER BY visitor_count DESC 
       LIMIT 6`
    );

    // Visitor Purpose Statistics
    const purposeStats = query(
      `SELECT purpose, COUNT(*) as count 
       FROM visitors 
       GROUP BY purpose 
       ORDER BY count DESC`
    );

    // Status Breakdown
    const statusStats = query(
      `SELECT status, COUNT(*) as count 
       FROM visitors 
       GROUP BY status`
    );

    // Department breakdown if employee matched
    const departmentStats = query(
      `SELECT e.department, COUNT(v.id) as count
       FROM visitors v
       JOIN employees e ON v.employee_id = e.id OR LOWER(v.person_to_meet) = LOWER(e.name)
       GROUP BY e.department
       ORDER BY count DESC`
    );

    // Daily Traffic for the last 14 days
    const past14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past14Days.push(d.toISOString().split('T')[0]);
    }

    const trafficHistory = past14Days.map((dateStr) => {
      const dayTotal = get('SELECT COUNT(*) as count FROM visitors WHERE visit_date = ?', [dateStr])?.count || 0;
      const checkedIn = get("SELECT COUNT(*) as count FROM visitors WHERE visit_date = ? AND status IN ('Checked In', 'Checked Out')", [dateStr])?.count || 0;
      return {
        date: dateStr,
        displayDate: dateStr.slice(5),
        total: dayTotal,
        checkedIn,
      };
    });

    res.json({
      success: true,
      summary: {
        dailyVisitors,
        weeklyVisitors,
        monthlyVisitors,
        currentlyInside,
        allTimeVisitors,
      },
      mostVisitedEmployees,
      purposeStats,
      statusStats,
      departmentStats,
      trafficHistory,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export visitor records to CSV file
 */
async function exportVisitorsCSV(req, res, next) {
  try {
    const { status, startDate, endDate } = req.query;

    const conditions = [];
    const params = [];

    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (startDate && endDate) {
      conditions.push('visit_date BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM visitors ${whereClause} ORDER BY visit_date DESC, created_at DESC`;
    const records = query(sql, params);

    // CSV Header row
    const headers = [
      'Visitor ID',
      'Full Name',
      'Phone',
      'Email',
      'Company',
      'Person To Meet',
      'Purpose',
      'Number of Visitors',
      'ID Proof Type',
      'ID Proof Number',
      'Visit Date',
      'Expected Arrival',
      'Expected Departure',
      'Check In Time',
      'Check Out Time',
      'Status',
      'Notes',
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(',')];

    for (const r of records) {
      const row = [
        escapeCSV(r.visitor_id),
        escapeCSV(r.full_name),
        escapeCSV(r.phone),
        escapeCSV(r.email),
        escapeCSV(r.company),
        escapeCSV(r.person_to_meet),
        escapeCSV(r.purpose),
        escapeCSV(r.number_of_visitors),
        escapeCSV(r.id_proof_type),
        escapeCSV(r.id_proof_number),
        escapeCSV(r.visit_date),
        escapeCSV(r.expected_arrival),
        escapeCSV(r.expected_departure),
        escapeCSV(r.check_in_time),
        escapeCSV(r.check_out_time),
        escapeCSV(r.status),
        escapeCSV(r.notes),
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\r\n');
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `visitor_records_${todayStr}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReports,
  exportVisitorsCSV,
};
