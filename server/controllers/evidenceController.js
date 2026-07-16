const db = require('../config/db');

// GET /api/evidence/case/:case_id
exports.getEvidenceByCase = async (req, res) => {
  const { case_id } = req.params;
  try {
    const query = `
      SELECT 
        e.evidence_id,
        e.case_id,
        e.evidence_type_id,
        et.type_name AS evidence_type_name,
        e.storage_id,
        sl.location_name AS storage_location_name,
        e.evidence_status_id,
        es.status_name AS evidence_status_name,
        e.description,
        e.collected_date
      FROM Evidence e
      LEFT JOIN Evidence_Type et ON e.evidence_type_id = et.evidence_type_id
      LEFT JOIN Storage_Location sl ON e.storage_id = sl.storage_id
      LEFT JOIN Evidence_Status es ON e.evidence_status_id = es.evidence_status_id
      WHERE e.case_id = ?
      ORDER BY e.collected_date DESC
    `;
    const [rows] = await db.query(query, [case_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching evidence by case:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// POST /api/evidence
exports.createEvidence = async (req, res) => {
  const {
    case_id,
    evidence_type_id,
    storage_id,
    evidence_status_id,
    description
  } = req.body;

  // Validation
  if (!case_id) {
    return res.status(400).json({ error: 'case_id is required' });
  }
  if (!evidence_type_id) {
    return res.status(400).json({ error: 'evidence_type_id is required' });
  }
  if (!storage_id) {
    return res.status(400).json({ error: 'storage_id is required' });
  }
  if (!evidence_status_id) {
    return res.status(400).json({ error: 'evidence_status_id is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Evidence (case_id, evidence_type_id, storage_id, evidence_status_id, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        parseInt(case_id),
        parseInt(evidence_type_id),
        parseInt(storage_id),
        parseInt(evidence_status_id),
        description || null
      ]
    );

    res.status(201).json({
      message: 'Evidence logged successfully',
      evidence_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating evidence:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
