const db = require('../config/db');

// GET all patients (joined with reference tables)
exports.getAllPatients = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.patient_id,
        p.full_name,
        p.nic,
        p.dob,
        p.address,
        p.gender_id,
        g.gender_name,
        p.district_id,
        d.district_name,
        p.marital_status_id,
        ms.status_name AS marital_status_name,
        p.blood_group_id,
        bg.blood_group_name
      FROM Patient p
      LEFT JOIN Gender g ON p.gender_id = g.gender_id
      LEFT JOIN District d ON p.district_id = d.district_id
      LEFT JOIN Marital_Status ms ON p.marital_status_id = ms.status_id
      LEFT JOIN Blood_Group bg ON p.blood_group_id = bg.blood_group_id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// GET patient by ID
exports.getPatientById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        p.patient_id,
        p.full_name,
        p.nic,
        p.dob,
        p.address,
        p.gender_id,
        g.gender_name,
        p.district_id,
        d.district_name,
        p.marital_status_id,
        ms.status_name AS marital_status_name,
        p.blood_group_id,
        bg.blood_group_name
      FROM Patient p
      LEFT JOIN Gender g ON p.gender_id = g.gender_id
      LEFT JOIN District d ON p.district_id = d.district_id
      LEFT JOIN Marital_Status ms ON p.marital_status_id = ms.status_id
      LEFT JOIN Blood_Group bg ON p.blood_group_id = bg.blood_group_id
      WHERE p.patient_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// POST create patient
exports.createPatient = async (req, res) => {
  const {
    full_name,
    name, // support either
    nic,
    dob,
    gender_id,
    district_id,
    marital_status_id,
    blood_group_id,
    address
  } = req.body;

  const patientName = full_name || name;

  // Simple validation
  if (!patientName) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Patient (full_name, nic, dob, gender_id, district_id, marital_status_id, blood_group_id, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientName,
        nic || null,
        dob || null,
        gender_id ? parseInt(gender_id) : null,
        district_id ? parseInt(district_id) : null,
        marital_status_id ? parseInt(marital_status_id) : null,
        blood_group_id ? parseInt(blood_group_id) : null,
        address || null
      ]
    );

    res.status(201).json({
      message: 'Patient registered successfully',
      patient_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// DELETE /api/patients/:id
exports.deletePatient = async (req, res) => {
  const { id } = req.params;
  const patientId = parseInt(id);

  if (isNaN(patientId)) {
    return res.status(400).json({ error: 'Invalid patient ID' });
  }

  try {
    // 1. Get all cases associated with this patient
    const [cases] = await db.query('SELECT case_id FROM Forensic_Case WHERE patient_id = ?', [patientId]);

    // 2. For each case, delete child records
    for (let c of cases) {
      const caseId = c.case_id;
      await db.query('DELETE FROM Clinical_Exam WHERE case_id = ?', [caseId]);
      await db.query('DELETE FROM Postmortem_Exam WHERE case_id = ?', [caseId]);
      await db.query('DELETE FROM Evidence WHERE case_id = ?', [caseId]);
      await db.query('DELETE FROM File_Attachment WHERE case_id = ?', [caseId]);
      await db.query('DELETE FROM Court_Report WHERE case_id = ?', [caseId]);
      await db.query('DELETE FROM Forensic_Case WHERE case_id = ?', [caseId]);
    }

    // 3. Finally, delete the patient record itself
    await db.query('DELETE FROM Patient WHERE patient_id = ?', [patientId]);

    res.json({ message: 'Patient and all associated forensic records deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
