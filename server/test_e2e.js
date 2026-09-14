/**
 * End-to-End Automated API Flow Verification Test
 */
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database/db');
const { seedDatabase } = require('./database/seed');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
initDatabase();
seedDatabase();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);

const server = app.listen(0);
const port = server.address().port;
const BASE_URL = `http://localhost:${port}/api`;

async function request(method, path, body = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, headers: res.headers, body: json };
}

async function runTests() {
  console.log('--- STARTING E2E VERIFICATION SUITE ---');

  // Test 1: Admin Login
  console.log('1. Testing Admin Login (admin@office.com / admin123)...');
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@office.com',
    password: 'admin123',
    role: 'admin',
  });
  if (adminLogin.status !== 200 || !adminLogin.body.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
  }
  const adminToken = adminLogin.body.token;
  console.log('   ✅ Admin logged in successfully. Token received.');

  // Test 2: Security Login
  console.log('2. Testing Security Login (security@office.com / security123)...');
  const secLogin = await request('POST', '/auth/login', {
    email: 'security@office.com',
    password: 'security123',
    role: 'security',
  });
  if (secLogin.status !== 200 || !secLogin.body.token) {
    throw new Error(`Security login failed: ${JSON.stringify(secLogin.body)}`);
  }
  const secToken = secLogin.body.token;
  console.log('   ✅ Security staff logged in successfully. Token received.');

  // Test 3: Dashboard Stats
  console.log('3. Testing Dashboard KPI & Traffic metrics...');
  const dashRes = await request('GET', '/dashboard/stats', null, adminToken);
  if (dashRes.status !== 200 || !dashRes.body.stats) {
    throw new Error(`Dashboard stats failed: ${JSON.stringify(dashRes.body)}`);
  }
  console.log('   ✅ Dashboard Stats:', dashRes.body.stats);
  console.log('   ✅ Traffic Days:', dashRes.body.trafficData.length);

  // Test 4: Visitor Registration
  console.log('4. Testing Visitor Registration & Unique Pass Generation...');
  const regRes = await request('POST', '/visitors', {
    full_name: 'Dr. Ronald Evans',
    phone: '+1-555-7890',
    email: 'r.evans@quantumresearch.org',
    company: 'Quantum Research Labs',
    person_to_meet: 'Alex Morgan (Engineering)',
    employee_id: 2,
    purpose: 'Technical Discussion',
    number_of_visitors: 1,
    id_proof_type: 'Passport',
    id_proof_number: 'PASS-998877',
    visit_date: new Date().toISOString().split('T')[0],
    expected_arrival: '14:30',
    expected_departure: '16:00',
    notes: 'Brought test equipment',
  });

  if (regRes.status !== 201 || !regRes.body.visitor) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
  }
  const newVisitor = regRes.body.visitor;
  console.log(`   ✅ Visitor created: ${newVisitor.full_name} with Visitor ID: ${newVisitor.visitor_id}`);
  if (!newVisitor.visitor_id.startsWith('VMS-')) {
    throw new Error(`Invalid visitor ID format: ${newVisitor.visitor_id}`);
  }

  // Test 5: Check-In Visitor
  console.log('5. Testing Visitor Check-In...');
  const checkInRes = await request('POST', `/visitors/${newVisitor.id}/checkin`, null, secToken);
  if (checkInRes.status !== 200 || checkInRes.body.visitor.status !== 'Checked In') {
    throw new Error(`Check-in failed: ${JSON.stringify(checkInRes.body)}`);
  }
  console.log(`   ✅ Checked In recorded at: ${checkInRes.body.visitor.check_in_time}`);

  // Test 6: Prevent Duplicate Check-In
  console.log('6. Testing Duplicate Check-In Prevention...');
  const dupCheckIn = await request('POST', `/visitors/${newVisitor.id}/checkin`, null, secToken);
  if (dupCheckIn.status !== 400) {
    throw new Error(`Duplicate check-in was NOT prevented! Status: ${dupCheckIn.status}`);
  }
  console.log(`   ✅ Duplicate check-in correctly blocked: "${dupCheckIn.body.message}"`);

  // Test 7: View Currently Inside
  console.log('7. Testing Currently Inside List...');
  const insideRes = await request('GET', '/visitors/inside', null, secToken);
  const isInside = insideRes.body.visitors.some((v) => v.id === newVisitor.id);
  if (!isInside) {
    throw new Error('New visitor not listed in Currently Inside visitors!');
  }
  console.log(`   ✅ Confirmed visitor is in "Currently Inside" list (${insideRes.body.count} total inside).`);

  // Test 8: Check-Out Visitor
  console.log('8. Testing Visitor Check-Out...');
  const checkOutRes = await request('POST', `/visitors/${newVisitor.id}/checkout`, null, secToken);
  if (checkOutRes.status !== 200 || checkOutRes.body.visitor.status !== 'Checked Out') {
    throw new Error(`Check-out failed: ${JSON.stringify(checkOutRes.body)}`);
  }
  console.log(`   ✅ Checked Out recorded at: ${checkOutRes.body.visitor.check_out_time}`);

  // Test 9: Reports & CSV Export
  console.log('9. Testing Reports & CSV Export Endpoint...');
  const reportsRes = await request('GET', '/reports', null, adminToken);
  if (reportsRes.status !== 200 || !reportsRes.body.summary) {
    throw new Error(`Reports failed: ${JSON.stringify(reportsRes.body)}`);
  }
  console.log('   ✅ Reports Summary:', reportsRes.body.summary);

  const csvRes = await request('GET', '/reports/export/csv', null, adminToken);
  if (csvRes.status !== 200 || typeof csvRes.body !== 'string' || !csvRes.body.includes('Visitor ID,Full Name')) {
    throw new Error('CSV Export failed or returned invalid header structure.');
  }
  console.log('   ✅ CSV Export verified: valid headers and formatted rows.');

  // Test 10: Employee Directory Management
  console.log('10. Testing Employee CRUD Operations...');
  const newEmpRes = await request('POST', '/employees', {
    name: 'Harrison Ford',
    email: 'harrison.ford@office.com',
    phone: '+1-555-9911',
    department: 'Operations',
    designation: 'Operations Specialist',
  }, adminToken);
  if (newEmpRes.status !== 201) {
    throw new Error(`Employee creation failed: ${JSON.stringify(newEmpRes.body)}`);
  }
  const empId = newEmpRes.body.employee.id;
  console.log(`   ✅ Employee created: ${newEmpRes.body.employee.name} (ID: ${empId})`);

  const delEmpRes = await request('DELETE', `/employees/${empId}`, null, adminToken);
  if (delEmpRes.status !== 200) {
    throw new Error(`Employee deletion failed: ${JSON.stringify(delEmpRes.body)}`);
  }
  console.log('   ✅ Employee deleted cleanly.');

  // Test 11: Security Role Authorization Guard
  console.log('11. Testing Role Guard (Security trying to access Admin-only /users)...');
  const guardRes = await request('GET', '/users', null, secToken);
  if (guardRes.status !== 403) {
    throw new Error(`Role authorization guard failed! Expected 403, got: ${guardRes.status}`);
  }
  console.log('   ✅ Role guard verified: Security correctly denied access to Admin-only route (403 Forbidden).');

  console.log('\n🎉 ALL 11 END-TO-END TESTS PASSED SUCCESSFULLY! 🎉');
  server.close();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err.message);
  server.close();
  process.exit(1);
});
