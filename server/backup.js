const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Configuration
const BACKUP_DIR = path.join(__dirname, 'backups');
const RETENTION_COUNT = 7; // Keep last 7 backups
const ENCRYPTION_ALGO = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || 'invex_default_secure_backup_key_2026';

// Helper to encrypt a buffer
function encrypt(buffer) {
  // Generate a key from the secret password using scrypt
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'invex_salt', 32);
  const iv = crypto.randomBytes(16); // Initialization Vector
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  // Prepend IV to the encrypted content so it can be extracted during decryption
  return Buffer.concat([iv, encrypted]);
}

// Clean up old backups based on retention policy
function purgeOldBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return;

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.enc'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      return {
        name: file,
        path: filePath,
        time: fs.statSync(filePath).mtime.getTime()
      };
    })
    .sort((a, b) => b.time - a.time); // Newest first

  if (files.length > RETENTION_COUNT) {
    const toDelete = files.slice(RETENTION_COUNT);
    toDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`[BACKUP ENGINE] Purged old backup: ${file.name}`);
    });
  }
}

// Perform SQLite backup
function backupSQLite() {
  console.log('[BACKUP ENGINE] Database dialect detected: SQLite.');
  const dbPath = path.join(__dirname, 'config', 'forensic_db.sqlite');
  
  if (!fs.existsSync(dbPath)) {
    console.error('[BACKUP ENGINE] SQLite database file not found. Skipping backup.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `sqlite_backup_${timestamp}.enc`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  try {
    const rawData = fs.readFileSync(dbPath);
    const encryptedData = encrypt(rawData);
    fs.writeFileSync(backupPath, encryptedData);
    console.log(`[BACKUP ENGINE] Secure SQLite backup created successfully: ${backupFileName}`);
    purgeOldBackups();
  } catch (err) {
    console.error('[BACKUP ENGINE] SQLite backup failed:', err.message);
  }
}

// Perform MySQL backup
async function backupMySQL() {
  console.log('[BACKUP ENGINE] Database dialect detected: MySQL.');
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'forensic_db';

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `mysql_backup_${timestamp}.enc`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  // We run mysqldump using child_process
  const dumpCmd = `mysqldump -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName}`;

  console.log(`[BACKUP ENGINE] Executing mysqldump on ${dbName}...`);
  exec(dumpCmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error('[BACKUP ENGINE] mysqldump command failed:', error.message);
      console.warn('[BACKUP ENGINE] Falling back to SQLite backup (checking if active local db exists)...');
      backupSQLite();
      return;
    }

    try {
      const encryptedData = encrypt(Buffer.from(stdout, 'utf8'));
      fs.writeFileSync(backupPath, encryptedData);
      console.log(`[BACKUP ENGINE] Secure MySQL backup created successfully: ${backupFileName}`);
      purgeOldBackups();
    } catch (err) {
      console.error('[BACKUP ENGINE] MySQL encryption or write failed:', err.message);
    }
  });
}

// Main Runner
async function run() {
  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Detect active configuration
  const hasMySQLConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

  if (!hasMySQLConfig) {
    backupSQLite();
    return;
  }

  // Verify connection to MySQL
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 1000
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.end();
    await backupMySQL();
  } catch (err) {
    console.warn(`[BACKUP ENGINE] MySQL connection check failed: ${err.message}. Falling back to SQLite backup...`);
    backupSQLite();
  }
}

// Execute backup run
run();
