const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Digital Visitor Management System Server running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔑 Admin: admin@office.com / admin123`);
  console.log(`🔑 Security: security@office.com / security123`);
  console.log(`====================================================`);
});
