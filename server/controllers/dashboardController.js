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
