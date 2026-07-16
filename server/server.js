const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database pool configuration (this will trigger connection verification test)
const db = require('./config/db');

// Import routes
const patientRoutes = require('./routes/patientRoutes');
const caseRoutes = require('./routes/caseRoutes');
const examRoutes = require('./routes/examRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'INVEX Forensic API is running smoothly' });
});

// Mount API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
