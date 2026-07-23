const db = require('../config/db');

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Execute count queries in parallel
    const [
      [patientsCount],
      [activeCasesCount],
      [completedAutopsiesCount],
      [pendingReportsCount]
    ] = await Promise.all([
      db.query('SELECT COUNT(*) AS count FROM Patient'),
      db.query('SELECT COUNT(*) AS count FROM Forensic_Case WHERE case_status_id IN (1, 2)'),
      db.query('SELECT COUNT(*) AS count FROM Forensic_Case WHERE case_type_id = 2'),
      db.query('SELECT COUNT(*) AS count FROM Court_Report WHERE report_status_id != 3')
    ]);

    // 2. Query the 5 most recently created forensic cases
    const recentCasesQuery = `
      SELECT 
        fc.case_id,
        p.full_name AS patient_name,
        ps.station_name,
        ct.type_name AS case_type_name,
        cs.status_name AS case_status_name
      FROM Forensic_Case fc
      LEFT JOIN Patient p ON fc.patient_id = p.patient_id
      LEFT JOIN Police_Station ps ON fc.station_id = ps.station_id
      LEFT JOIN Case_Type ct ON fc.case_type_id = ct.case_type_id
      LEFT JOIN Case_Status cs ON fc.case_status_id = cs.case_status_id
      ORDER BY fc.case_id DESC
      LIMIT 5
    `;
    const [recentCases] = await db.query(recentCasesQuery);

    // 3. Assemble and return response
    res.json({
      stats: {
        totalPatients: patientsCount[0].count,
        activeCases: activeCasesCount[0].count,
        completedAutopsies: completedAutopsiesCount[0].count,
        pendingReports: pendingReportsCount[0].count
      },
      recentCases
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const { exec } = require('child_process');
const path = require('path');

// Helper to run exec as a promise
const runExec = (cmd) => new Promise((resolve) => {
  exec(cmd, (error, stdout, stderr) => {
    resolve({ error, stdout, stderr });
  });
});

// GET /api/dashboard/backup-plan
exports.getBackupPlan = async (req, res) => {
  if (process.platform === 'win32') {
    return res.json({ plan: 'windows_scheduler', message: 'Backups are managed by Windows Task Scheduler' });
  }

  try {
    const { error, stdout } = await runExec('crontab -l');
    if (error) {
      // If crontab fails (e.g. no crontab set yet), return disabled
      return res.json({ plan: 'disabled' });
    }

    const lines = stdout.split('\n');
    const backupLine = lines.find(line => line.includes('backup.js'));

    if (!backupLine) {
      return res.json({ plan: 'disabled' });
    }

    // Parse cron expression
    const trimmedLine = backupLine.trim();
    if (trimmedLine.startsWith('0 0 * * *')) {
      return res.json({ plan: 'daily' });
    } else if (trimmedLine.startsWith('0 0,12 * * *')) {
      return res.json({ plan: 'twice_daily' });
    } else if (trimmedLine.startsWith('0 0 * * 0')) {
      return res.json({ plan: 'weekly' });
    } else {
      return res.json({ plan: 'custom', expression: trimmedLine.split(' ').slice(0, 5).join(' ') });
    }
  } catch (err) {
    console.error('Error reading backup plan:', err);
    res.status(500).json({ error: 'Failed to read backup plan', details: err.message });
  }
};

// POST /api/dashboard/backup-plan
exports.updateBackupPlan = async (req, res) => {
  const { plan } = req.body;
  const validPlans = ['disabled', 'daily', 'twice_daily', 'weekly'];

  if (!validPlans.includes(plan)) {
    return res.status(400).json({ error: 'Invalid backup plan' });
  }

  if (process.platform === 'win32') {
    return res.status(400).json({ error: 'On Windows, backups must be managed via Task Scheduler.' });
  }

  try {
    // 1. Read current crontab
    const { stdout } = await runExec('crontab -l');
    const currentCron = stdout ? stdout.trim() : '';

    // 2. Filter out existing backup.js lines
    const lines = currentCron.split('\n').filter(line => line.trim() && !line.includes('backup.js'));

    // 3. Append new line if not disabled
    if (plan !== 'disabled') {
      let cronExpr = '0 0 * * *'; // default daily
      if (plan === 'twice_daily') cronExpr = '0 0,12 * * *';
      if (plan === 'weekly') cronExpr = '0 0 * * 0';

      const nodePath = '/usr/bin/node';
      const scriptPath = path.join(__dirname, '../backup.js');
      const logPath = path.join(__dirname, '../backups/backup_cron.log');

      lines.push(`${cronExpr} ${nodePath} "${scriptPath}" >> "${logPath}" 2>&1`);
    }

    // 4. Write back to crontab
    if (lines.length === 0) {
      // Clear crontab
      await runExec('crontab -r');
      console.log('[BACKUP CONTROLLER] Cleared crontab.');
    } else {
      const newCronContent = lines.join('\n') + '\n';
      // Escape for bash echo command
      const escapedCron = newCronContent.replace(/"/g, '\\"').replace(/`/g, '\\`');
      const writeCmd = `echo "${escapedCron}" | crontab -`;
      const { error, stderr } = await runExec(writeCmd);
      if (error) {
        throw new Error(stderr || 'Failed to execute crontab write command');
      }
    }

    res.json({ message: `Backup plan updated to: ${plan}` });
  } catch (err) {
    console.error('Error updating backup plan:', err);
    res.status(500).json({ error: 'Failed to update backup plan', details: err.message });
  }
};

// POST /api/dashboard/backup-now
exports.backupNow = async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../backup.js');
    exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Manual backup failed:', error);
        return res.status(500).json({ error: 'Backup process failed to run', details: stderr || error.message });
      }
      res.json({ message: 'Backup created successfully!', details: stdout });
    });
  } catch (err) {
    console.error('Error triggering manual backup:', err);
    res.status(500).json({ error: 'Failed to initiate backup', details: err.message });
  }
};
