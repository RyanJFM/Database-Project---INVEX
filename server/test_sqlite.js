const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

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

async function main() {
  const dbPath = path.join(__dirname, 'test_forensic.sqlite');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  const schemaPath = path.join(__dirname, 'database_setup.sql');
  const db = new DatabaseSync(dbPath);
  
  console.log('Translating and running schema on SQLite...');
  try {
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    const sqliteSql = convertToSQLite(sqlContent);
    
    db.exec('PRAGMA foreign_keys = OFF;');
    const statements = sqliteSql.split(';');
    for (let statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      db.exec(trimmed);
    }
    db.exec('PRAGMA foreign_keys = ON;');
    console.log('SQLite database initialized successfully.');
    
    // Run dashboard stats query
    console.log('Testing dashboard query 1: Patient count');
    const stmt1 = db.prepare('SELECT COUNT(*) AS count FROM Patient');
    console.log('Result 1:', stmt1.all());

    console.log('Testing dashboard query 2: Forensic_Case active count');
    const stmt2 = db.prepare('SELECT COUNT(*) AS count FROM Forensic_Case WHERE case_status_id IN (1, 2)');
    console.log('Result 2:', stmt2.all());

    console.log('Testing dashboard query 3: Forensic_Case autopsy count');
    const stmt3 = db.prepare('SELECT COUNT(*) AS count FROM Forensic_Case WHERE case_type_id = 2');
    console.log('Result 3:', stmt3.all());

    console.log('Testing dashboard query 4: Court_Report pending count');
    const stmt4 = db.prepare('SELECT COUNT(*) AS count FROM Court_Report WHERE report_status_id != 3');
    console.log('Result 4:', stmt4.all());

  } catch (err) {
    console.error('Error during SQLite test:', err);
  } finally {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  }
}

main();
