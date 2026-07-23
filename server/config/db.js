const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Ensure environment variables are loaded from the server root .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool;
let isSQLite = false;

// MySQL connection parameters
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forensic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000, // shorter timeout so fallback is quick
  acquireTimeout: 2000,
  multipleStatements: true
};

// SQLite dialect translation helper
function convertToSQLite(sql) {
  let cleanedSql = sql.replace(/DROP TABLE IF EXISTS\s+([^;]+)/gi, (match, tableList) => {
    return tableList.split(',').map(t => `DROP TABLE IF EXISTS ${t.trim()}`).join('; ');
  });

  return cleanedSql
    .replace(/CREATE DATABASE[^;]+;/gi, '')
    .replace(/USE [^;]+;/gi, '')
    .replace(/SET FOREIGN_KEY_CHECKS\s*=\s*\d;/gi, '')
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/INT PRIMARY KEY AUTO_INCREMENT/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
    .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TEXT DEFAULT CURRENT_TIMESTAMP')
    .replace(/DATE/gi, 'TEXT');
}

class SQLitePool {
  constructor(dbPath, schemaPath) {
    this.dbPath = dbPath;
    this.schemaPath = schemaPath;
    this.db = null;
    this.init();
  }

  init() {
    const { DatabaseSync } = require('node:sqlite');
    const dbExists = fs.existsSync(this.dbPath);
    this.db = new DatabaseSync(this.dbPath);

    if (!dbExists || this.isEmpty()) {
      console.log('[INVEX DB] Initializing local SQLite database (forensic_db.sqlite)...');
      try {
        const sqlContent = fs.readFileSync(this.schemaPath, 'utf8');
        const sqliteSql = convertToSQLite(sqlContent);
        
        this.db.exec('PRAGMA foreign_keys = OFF;');
        const statements = sqliteSql.split(';');
        for (let statement of statements) {
          const trimmed = statement.trim();
          if (!trimmed) continue;
          this.db.exec(trimmed);
        }
        this.db.exec('PRAGMA foreign_keys = ON;');
        console.log('[INVEX DB] SQLite database initialized and seeded successfully.');
      } catch (err) {
        console.error('[INVEX DB] Failed to initialize SQLite database:', err.message);
        // Clean up the file so it retries cleanly next time
        try {
          this.db.close();
          fs.unlinkSync(this.dbPath);
        } catch (e) {}
      }
    }
  }

  isEmpty() {
    try {
      const row = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='User'").all();
      return row.length === 0;
    } catch {
      return true;
    }
  }

  async query(sql, params = []) {
    try {
      const trimmedSql = sql.trim();
      const isInsert = trimmedSql.toUpperCase().startsWith('INSERT');
      const stmt = this.db.prepare(sql);
      if (isInsert) {
        const result = stmt.run(...params);
        return [{ insertId: result.lastInsertRowid }];
      } else {
        const rows = stmt.all(...params);
        const plainRows = rows.map(row => ({ ...row }));
        return [plainRows];
      }
    } catch (err) {
      console.error('[INVEX DB] SQLite query error:', err.message);
      throw err;
    }
  }

  async getConnection() {
    return {
      release: () => {}
    };
  }
}

// Check configuration
const hasMySQLConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

if (!hasMySQLConfig) {
  console.log('[INVEX DB] No MySQL configuration found in env. Setting up zero-setup SQLite database...');
  setupSQLite();
} else {
  // Try connecting to MySQL
  pool = mysql.createPool(dbConfig);
  pool.getConnection()
    .then(async (connection) => {
      console.log('[INVEX DB] Successfully connected to MySQL database (forensic_db) pool.');
      try {
        // Verify if tables are initialized in MySQL
        const [tables] = await connection.query('SHOW TABLES');
        const hasUserTable = tables.some(t => Object.values(t)[0].toLowerCase() === 'user');
        if (!hasUserTable) {
          console.log('[INVEX DB] MySQL database is empty or missing tables. Initializing from database_setup.sql...');
          const schemaPath = path.join(__dirname, '../database_setup.sql');
          const sqlContent = fs.readFileSync(schemaPath, 'utf8');
          await connection.query(sqlContent);
          console.log('[INVEX DB] MySQL database initialized and seeded successfully.');
        }
      } catch (err) {
        console.error('[INVEX DB] Failed to verify or auto-initialize MySQL database tables:', err.message);
      } finally {
        connection.release();
      }
    })
    .catch((err) => {
      console.warn(`[INVEX DB] MySQL connection failed (${err.message}). Falling back to zero-setup SQLite database...`);
      setupSQLite();
    });
}

function setupSQLite() {
  const dbPath = path.join(__dirname, 'forensic_db.sqlite');
  const schemaPath = path.join(__dirname, '../database_setup.sql');
  
  try {
    // Check if node:sqlite is available
    require('node:sqlite');
    pool = new SQLitePool(dbPath, schemaPath);
    isSQLite = true;
  } catch (err) {
    console.error('[INVEX DB] SQLite is not available on this Node version. Please use Node.js v22+ or configure MySQL.');
    // Keep MySQL pool instance (which will fail queries but not crash on boot)
    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
  }
}

// Proxy wrapper to expose the pool interface dynamically
const dbProxy = {
  query: async (...args) => {
    return pool.query(...args);
  },
  getConnection: async (...args) => {
    return pool.getConnection(...args);
  }
};

module.exports = dbProxy;
