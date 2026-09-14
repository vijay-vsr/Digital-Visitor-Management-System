const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { initDatabase } = require('./database/db');
const { seedDatabase } = require('./database/seed');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize and seed database
try {
  initDatabase();
  seedDatabase();
  console.log('Database initialized and verified successfully.');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: true, // Allow frontend dev server
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Digital Visitor Management System API',
    time: new Date().toISOString(),
  });
});

// Serve static frontend if client/dist exists (Production deployment)
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Centralized Error Handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Digital Visitor Management System Server running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔑 Admin: admin@office.com / admin123`);
  console.log(`🔑 Security: security@office.com / security123`);
  console.log(`====================================================`);
});
