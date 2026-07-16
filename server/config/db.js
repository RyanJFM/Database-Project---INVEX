const mysql = require('mysql2/promise');
const path = require('path');

// Ensure environment variables are loaded from the server root .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forensic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000,
  acquireTimeout: 5000
});

// Immediately test connection to confirm successful connection config
pool.getConnection()
  .then((connection) => {
    console.log('Successfully connected to the MySQL database (forensic_db) pool.');
    connection.release();
  })
  .catch((err) => {
    console.error('Database connection test failed:', err.message);
  });

module.exports = pool;
