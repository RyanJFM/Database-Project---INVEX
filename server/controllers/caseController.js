const db = require('../config/db');

// GET all forensic cases (joined with references)
exports.getAllCases = async (req, res) => {
  try {
    const query = `
      SELECT 
        fc.case_id,
        fc.patient_id,
        p.full_name AS patient_name,
        fc.user_id,
        fc.station_id,
        ps.station_name,
        fc.court_id,
        c.court_name,
        fc.case_type_id,
        ct.type_name AS case_type_name,
        fc.case_status_id,
        cs.status_name AS case_status_name,
        fc.incident_date,
        fc.description
      FROM Forensic_Case fc
      LEFT JOIN Patient p ON fc.patient_id = p.patient_id
      LEFT JOIN Police_Station ps ON fc.station_id = ps.station_id
      LEFT JOIN Court c ON fc.court_id = c.court_id
      LEFT JOIN Case_Type ct ON fc.case_type_id = ct.case_type_id
      LEFT JOIN Case_Status cs ON fc.case_status_id = cs.case_status_id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching forensic cases:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// GET forensic case by ID
exports.getCaseById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        fc.case_id,
        fc.patient_id,
        p.full_name AS patient_name,
        fc.user_id,
        fc.station_id,
        ps.station_name,
        fc.court_id,
        c.court_name,
        fc.case_type_id,
        ct.type_name AS case_type_name,
        fc.case_status_id,
        cs.status_name AS case_status_name,
        fc.incident_date,
        fc.description
      FROM Forensic_Case fc
      LEFT JOIN Patient p ON fc.patient_id = p.patient_id
      LEFT JOIN Police_Station ps ON fc.station_id = ps.station_id
      LEFT JOIN Court c ON fc.court_id = c.court_id
      LEFT JOIN Case_Type ct ON fc.case_type_id = ct.case_type_id
      LEFT JOIN Case_Status cs ON fc.case_status_id = cs.case_status_id
      WHERE fc.case_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Forensic case not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching forensic case:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// POST create forensic case
exports.createCase = async (req, res) => {
  const {
    patient_id,
    user_id,
    station_id,
    court_id,
    case_type_id,
    case_status_id,
    incident_date,
    description
  } = req.body;

  // Simple validation
  if (!patient_id) {
    return res.status(400).json({ error: 'patient_id is required' });
  }
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  if (!case_type_id) {
    return res.status(400).json({ error: 'case_type_id is required' });
  }
  if (!case_status_id) {
    return res.status(400).json({ error: 'case_status_id is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Forensic_Case (patient_id, user_id, station_id, court_id, case_type_id, case_status_id, incident_date, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(patient_id),
        parseInt(user_id),
        station_id ? parseInt(station_id) : null,
        court_id ? parseInt(court_id) : null,
        parseInt(case_type_id),
        parseInt(case_status_id),
        incident_date || null,
        description || null
      ]
    );

    res.status(201).json({
      message: 'Forensic case created successfully',
      case_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating forensic case:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
