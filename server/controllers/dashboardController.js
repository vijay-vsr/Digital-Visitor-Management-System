const { query, get } = require('../database/db');

/**
 * Get dashboard statistics and charts
 */
async function getDashboardStats(req, res, next) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Core KPIs
    const totalTodayRow = get(
      'SELECT COUNT(*) as count FROM visitors WHERE visit_date = ?',
      [todayStr]
    );
    const totalVisitorsToday = totalTodayRow ? totalTodayRow.count : 0;

    const currentlyInsideRow = get(
      "SELECT COUNT(*) as count FROM visitors WHERE status = 'Checked In'"
    );
    const currentlyInside = currentlyInsideRow ? currentlyInsideRow.count : 0;

    const checkedOutTodayRow = get(
      "SELECT COUNT(*) as count FROM visitors WHERE visit_date = ? AND status = 'Checked Out'",
      [todayStr]
    );
    const checkedOutToday = checkedOutTodayRow ? checkedOutTodayRow.count : 0;

    const expectedTodayRow = get(
      "SELECT COUNT(*) as count FROM visitors WHERE visit_date = ? AND status = 'Expected'",
      [todayStr]
    );
    const expectedToday = expectedTodayRow ? expectedTodayRow.count : 0;

    const totalEmployeesRow = get(
      'SELECT COUNT(*) as count FROM employees WHERE is_active = 1'
    );
    const totalEmployees = totalEmployeesRow ? totalEmployeesRow.count : 0;

    // 2. Recent Visitors (latest 8)
    const recentVisitors = query(
      `SELECT id, visitor_id, full_name, phone, company, person_to_meet, purpose,
              visit_date, expected_arrival, check_in_time, check_out_time, status
       FROM visitors
       ORDER BY created_at DESC
       LIMIT 8`
    );

    // 3. Last 7 Days Visitor Traffic Chart Data
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(d.toISOString().split('T')[0]);
    }

    const trafficData = past7Days.map((dateStr) => {
      const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
      });

      const dayTotal = get(
        'SELECT COUNT(*) as count FROM visitors WHERE visit_date = ?',
        [dateStr]
      );
      const dayCheckedIn = get(
        "SELECT COUNT(*) as count FROM visitors WHERE visit_date = ? AND status IN ('Checked In', 'Checked Out')",
        [dateStr]
      );

      return {
        date: dateStr,
        day: dayName,
        total: dayTotal ? dayTotal.count : 0,
        attended: dayCheckedIn ? dayCheckedIn.count : 0,
      };
    });

    // 4. Visitors by Purpose breakdown
    const purposeStats = query(
      `SELECT purpose, COUNT(*) as count 
       FROM visitors 
       GROUP BY purpose 
       ORDER BY count DESC 
       LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalVisitorsToday,
        currentlyInside,
        checkedOutToday,
        expectedToday,
        totalEmployees,
      },
      recentVisitors,
      trafficData,
      purposeStats,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
};
