const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BACKUP_DIR = path.join(__dirname, 'backups');
const ENCRYPTION_ALGO = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || 'invex_default_secure_backup_key_2026';

// Helper to decrypt a buffer
function decrypt(buffer) {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'invex_salt', 32);
  
  // Extract IV (first 16 bytes)
  const iv = buffer.slice(0, 16);
  // Extract encrypted data payload
  const encrypted = buffer.slice(16);
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// Parse arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`
Usage: node restore.js <backup-file-name>

Example:
  node restore.js sqlite_backup_2026-07-23T06-44-12-321Z.enc
  `);
  process.exit(1);
}

const backupFileName = args[0];
const backupFilePath = path.isAbsolute(backupFileName) 
  ? backupFileName 
  : path.join(BACKUP_DIR, backupFileName);

if (!fs.existsSync(backupFilePath)) {
  console.error(`[RESTORE ENGINE] Backup file not found: ${backupFilePath}`);
  process.exit(1);
}

async function main() {
  console.log(`[RESTORE ENGINE] Starting decryption on: ${backupFileName}...`);
  try {
    const encryptedData = fs.readFileSync(backupFilePath);
    const decryptedData = decrypt(encryptedData);

    if (backupFileName.startsWith('sqlite_')) {
      console.log('[RESTORE ENGINE] SQLite dialect detected from filename.');
      const destPath = path.join(__dirname, 'config', 'forensic_db.sqlite');
      
      // Close database connection if app is running locally, or warn
      fs.writeFileSync(destPath, decryptedData);
      console.log(`[RESTORE ENGINE] SQLite database restored successfully to: ${destPath}`);
    } else if (backupFileName.startsWith('mysql_')) {
      console.log('[RESTORE ENGINE] MySQL dialect detected from filename.');
      const tempSqlPath = path.join(__dirname, 'restore_temp.sql');
      
      fs.writeFileSync(tempSqlPath, decryptedData);
      console.log(`[RESTORE ENGINE] Decrypted SQL dump written to: ${tempSqlPath}`);
      
      // Connect strings
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbUser = process.env.DB_USER || 'root';
      const dbPassword = process.env.DB_PASSWORD || '';
      const dbName = process.env.DB_NAME || 'forensic_db';
      
      const restoreCmd = `mysql -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} < "${tempSqlPath}"`;
      
      console.log(`[RESTORE ENGINE] Executing restore command on ${dbName}...`);
      exec(restoreCmd, (error, stdout, stderr) => {
        // Clean up decrypted temp SQL file immediately for security!
        fs.unlinkSync(tempSqlPath);
        
        if (error) {
          console.error('[RESTORE ENGINE] Failed to pipe SQL query into MySQL:', error.message);
          console.log('[RESTORE ENGINE] You can manually run the decrypted SQL query if needed.');
          return;
        }
        console.log('[RESTORE ENGINE] MySQL database restored successfully.');
      });
    } else {
      console.error('[RESTORE ENGINE] Unknown database dialect format. Filename must start with "sqlite_" or "mysql_"');
    }
  } catch (err) {
    console.error('[RESTORE ENGINE] Decryption or restore failed:', err.message);
  }
}

main();
