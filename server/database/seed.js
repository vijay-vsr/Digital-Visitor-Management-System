const bcrypt = require('bcryptjs');
const { get, query, run } = require('./db');

function seedDatabase() {
  // Check if users already seeded
  const existingAdmin = get('SELECT id FROM users WHERE email = ?', ['admin@office.com']);
  if (existingAdmin) {
    return; // Database already seeded
  }

  console.log('Seeding initial data...');

  // 1. Seed Users (Admin and Security)
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const securityPasswordHash = bcrypt.hashSync('security123', 10);

  run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['System Administrator', 'admin@office.com', adminPasswordHash, 'admin']
  );

  run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Front Desk Security', 'security@office.com', securityPasswordHash, 'security']
  );

  // 2. Seed Employees
  const employees = [
    { name: 'Sarah Jenkins', email: 'sarah.jenkins@office.com', phone: '+1-555-0101', department: 'Human Resources', designation: 'HR Director' },
    { name: 'Alex Morgan', email: 'alex.morgan@office.com', phone: '+1-555-0102', department: 'Engineering', designation: 'Lead Systems Architect' },
    { name: 'David Chen', email: 'david.chen@office.com', phone: '+1-555-0103', department: 'Engineering', designation: 'Senior Full Stack Developer' },
    { name: 'Emily Rodriguez', email: 'emily.r@office.com', phone: '+1-555-0104', department: 'Product', designation: 'Product Manager' },
    { name: 'Michael Chang', email: 'michael.c@office.com', phone: '+1-555-0105', department: 'Finance', designation: 'Financial Controller' },
    { name: 'Jessica Taylor', email: 'jessica.t@office.com', phone: '+1-555-0106', department: 'Marketing', designation: 'Head of Marketing' },
    { name: 'Robert Wilson', email: 'robert.w@office.com', phone: '+1-555-0107', department: 'Operations', designation: 'VP of Operations' },
    { name: 'Priya Sharma', email: 'priya.s@office.com', phone: '+1-555-0108', department: 'Legal', designation: 'Legal Counsel' },
  ];

  for (const emp of employees) {
    run(
      'INSERT INTO employees (name, email, phone, department, designation) VALUES (?, ?, ?, ?, ?)',
      [emp.name, emp.email, emp.phone, emp.department, emp.designation]
    );
  }

  // 3. Seed Settings
  const settings = [
    ['office_name', 'Apex Global Technologies'],
    ['office_address', 'Tech Innovation Tower, 4th Floor, Silicon Avenue'],
    ['contact_phone', '+1 (555) 019-2834'],
    ['contact_email', 'reception@apextech.io'],
    ['visitor_pass_instructions', 'Please wear your visitor badge at all times. Return pass to reception upon exit.'],
  ];

  for (const [key, value] of settings) {
    run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }

  // Get current date string (YYYY-MM-DD)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Past dates for historical data
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Helper timestamps
  const isoTime = (dateStr, timeStr) => `${dateStr} ${timeStr}:00`;

  // 4. Seed Visitors
  const sampleVisitors = [
    // Currently Checked In (Today)
    {
      visitor_id: 'VMS-20260914-8821',
      full_name: 'Jonathan Vance',
      phone: '+1-555-2490',
      email: 'j.vance@cloudscale.net',
      company: 'CloudScale Solutions',
      person_to_meet: 'Alex Morgan',
      employee_id: 2,
      purpose: 'Technical Discussion',
      number_of_visitors: 1,
      id_proof_type: 'Driving License',
      id_proof_number: 'DL-982341-CA',
      visit_date: todayStr,
      expected_arrival: '09:30',
      expected_departure: '12:30',
      check_in_time: isoTime(todayStr, '09:28'),
      check_out_time: null,
      status: 'Checked In',
      notes: 'Hardware demo equipment brought into server room',
    },
    {
      visitor_id: 'VMS-20260914-4192',
      full_name: 'Elena Rostova',
      phone: '+1-555-8321',
      email: 'elena@talentmatrix.com',
      company: 'TalentMatrix Consulting',
      person_to_meet: 'Sarah Jenkins',
      employee_id: 1,
      purpose: 'Job Interview',
      number_of_visitors: 1,
      id_proof_type: 'Passport',
      id_proof_number: 'P89201948',
      visit_date: todayStr,
      expected_arrival: '10:00',
      expected_departure: '11:30',
      check_in_time: isoTime(todayStr, '09:55'),
      check_out_time: null,
      status: 'Checked In',
      notes: 'Candidate for Senior UX position',
    },
    {
      visitor_id: 'VMS-20260914-7740',
      full_name: 'Marcus Brody',
      phone: '+1-555-3399',
      email: 'marcus@brodyinvestments.com',
      company: 'Brody Capital Partners',
      person_to_meet: 'Michael Chang',
      employee_id: 5,
      purpose: 'Business Meeting',
      number_of_visitors: 2,
      id_proof_type: 'National ID',
      id_proof_number: 'NID-7739102',
      visit_date: todayStr,
      expected_arrival: '11:00',
      expected_departure: '13:00',
      check_in_time: isoTime(todayStr, '11:05'),
      check_out_time: null,
      status: 'Checked In',
      notes: 'Quarterly financial review',
    },

    // Checked Out (Today)
    {
      visitor_id: 'VMS-20260914-1109',
      full_name: 'Amanda Clark',
      phone: '+1-555-6671',
      email: 'amanda.clark@expressdelivery.org',
      company: 'Express Logistics',
      person_to_meet: 'Robert Wilson',
      employee_id: 7,
      purpose: 'Delivery',
      number_of_visitors: 1,
      id_proof_type: 'Employee ID',
      id_proof_number: 'EXP-4401',
      visit_date: todayStr,
      expected_arrival: '08:30',
      expected_departure: '09:00',
      check_in_time: isoTime(todayStr, '08:35'),
      check_out_time: isoTime(todayStr, '08:55'),
      status: 'Checked Out',
      notes: 'Delivered prototype components',
    },
    {
      visitor_id: 'VMS-20260914-3580',
      full_name: 'Vikram Mehta',
      phone: '+1-555-9014',
      email: 'v.mehta@nexusanalytics.com',
      company: 'Nexus Analytics',
      person_to_meet: 'David Chen',
      employee_id: 3,
      purpose: 'Vendor Meeting',
      number_of_visitors: 1,
      id_proof_type: 'National ID',
      id_proof_number: 'IND-902381',
      visit_date: todayStr,
      expected_arrival: '09:00',
      expected_departure: '10:15',
      check_in_time: isoTime(todayStr, '08:58'),
      check_out_time: isoTime(todayStr, '10:20'),
      status: 'Checked Out',
      notes: 'Software integration kickoff',
    },

    // Expected (Today)
    {
      visitor_id: 'VMS-20260914-9912',
      full_name: 'Claire Beauchamp',
      phone: '+1-555-7722',
      email: 'claire.b@globalmedia.com',
      company: 'Global Media Group',
      person_to_meet: 'Jessica Taylor',
      employee_id: 6,
      purpose: 'Press / Media',
      number_of_visitors: 1,
      id_proof_type: 'Driving License',
      id_proof_number: 'DL-448201-WA',
      visit_date: todayStr,
      expected_arrival: '14:00',
      expected_departure: '15:30',
      check_in_time: null,
      check_out_time: null,
      status: 'Expected',
      notes: 'Annual tech symposium interview',
    },
    {
      visitor_id: 'VMS-20260914-5561',
      full_name: 'Brian O\'Connor',
      phone: '+1-555-1288',
      email: 'brian@securedata.net',
      company: 'SecureData Audit Inc',
      person_to_meet: 'Priya Sharma',
      employee_id: 8,
      purpose: 'Compliance Audit',
      number_of_visitors: 2,
      id_proof_type: 'Passport',
      id_proof_number: 'P33019284',
      visit_date: todayStr,
      expected_arrival: '15:00',
      expected_departure: '17:00',
      check_in_time: null,
      check_out_time: null,
      status: 'Expected',
      notes: 'ISO compliance documentation check',
    },

    // Past Visitors (Yesterday and earlier for historical charts)
    {
      visitor_id: 'VMS-20260913-2001',
      full_name: 'Daniel Craig',
      phone: '+1-555-4421',
      email: 'dcraig@innovate.co',
      company: 'Innovate Works',
      person_to_meet: 'Emily Rodriguez',
      employee_id: 4,
      purpose: 'Client Meeting',
      number_of_visitors: 3,
      id_proof_type: 'National ID',
      id_proof_number: 'NID-992384',
      visit_date: yesterday,
      expected_arrival: '10:00',
      expected_departure: '12:00',
      check_in_time: isoTime(yesterday, '10:02'),
      check_out_time: isoTime(yesterday, '12:15'),
      status: 'Checked Out',
      notes: 'Product Roadmap Review',
    },
    {
      visitor_id: 'VMS-20260913-2002',
      full_name: 'Samantha Ray',
      phone: '+1-555-9988',
      email: 'samantha@greenleaf.com',
      company: 'Greenleaf Facilities',
      person_to_meet: 'Robert Wilson',
      employee_id: 7,
      purpose: 'Maintenance',
      number_of_visitors: 2,
      id_proof_type: 'Driving License',
      id_proof_number: 'DL-772184-NY',
      visit_date: yesterday,
      expected_arrival: '13:00',
      expected_departure: '15:00',
      check_in_time: isoTime(yesterday, '12:55'),
      check_out_time: isoTime(yesterday, '14:50'),
      status: 'Checked Out',
      notes: 'HVAC system quarterly inspection',
    },
    {
      visitor_id: 'VMS-20260912-3001',
      full_name: 'Kevin Hart',
      phone: '+1-555-8833',
      email: 'kevin.h@apexsuppliers.com',
      company: 'Apex Supplies Ltd',
      person_to_meet: 'Sarah Jenkins',
      employee_id: 1,
      purpose: 'Vendor Meeting',
      number_of_visitors: 1,
      id_proof_type: 'Employee ID',
      id_proof_number: 'EMP-9938',
      visit_date: twoDaysAgo,
      expected_arrival: '11:00',
      expected_departure: '12:00',
      check_in_time: isoTime(twoDaysAgo, '11:00'),
      check_out_time: isoTime(twoDaysAgo, '11:50'),
      status: 'Checked Out',
      notes: 'Office ergonomics equipment proposal',
    },
    {
      visitor_id: 'VMS-20260911-4001',
      full_name: 'Lucas Gray',
      phone: '+1-555-2234',
      email: 'lucas.gray@greengrid.org',
      company: 'GreenGrid Energy',
      person_to_meet: 'Alex Morgan',
      employee_id: 2,
      purpose: 'Technical Discussion',
      number_of_visitors: 1,
      id_proof_type: 'Driving License',
      id_proof_number: 'DL-119283-OR',
      visit_date: threeDaysAgo,
      expected_arrival: '14:00',
      expected_departure: '16:00',
      check_in_time: isoTime(threeDaysAgo, '14:05'),
      check_out_time: isoTime(threeDaysAgo, '16:10'),
      status: 'Checked Out',
      notes: 'Data center energy efficiency review',
    }
  ];

  for (const v of sampleVisitors) {
    run(
      `INSERT INTO visitors (
        visitor_id, full_name, phone, email, company, person_to_meet, employee_id,
        purpose, number_of_visitors, id_proof_type, id_proof_number, visit_date,
        expected_arrival, expected_departure, check_in_time, check_out_time, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        v.visitor_id, v.full_name, v.phone, v.email, v.company, v.person_to_meet, v.employee_id,
        v.purpose, v.number_of_visitors, v.id_proof_type, v.id_proof_number, v.visit_date,
        v.expected_arrival, v.expected_departure, v.check_in_time, v.check_out_time, v.status, v.notes
      ]
    );
  }

  console.log('Seeding completed successfully!');
}

module.exports = { seedDatabase };
