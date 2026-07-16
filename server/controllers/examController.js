const db = require('../config/db');

// POST /api/exams/clinical
exports.createClinicalExam = async (req, res) => {
  const { case_id, exam_type_id, injury_details } = req.body;

  // Validation
  if (!case_id) {
    return res.status(400).json({ error: 'case_id is required' });
  }
  if (!exam_type_id) {
    return res.status(400).json({ error: 'exam_type_id is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Clinical_Exam (case_id, exam_type_id, injury_details) 
       VALUES (?, ?, ?)`,
      [
        parseInt(case_id),
        parseInt(exam_type_id),
        injury_details || null
      ]
    );

    res.status(201).json({
      message: 'Clinical exam details saved successfully',
      clinical_id: result.insertId
    });
  } catch (error) {
    console.error('Error saving clinical exam details:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// POST /api/exams/postmortem
exports.createPostmortemExam = async (req, res) => {
  const { case_id, cod_category_id, cause_of_death } = req.body;

  // Validation
  if (!case_id) {
    return res.status(400).json({ error: 'case_id is required' });
  }
  if (!cod_category_id) {
    return res.status(400).json({ error: 'cod_category_id is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Postmortem_Exam (case_id, cod_category_id, cause_of_death) 
       VALUES (?, ?, ?)`,
      [
        parseInt(case_id),
        parseInt(cod_category_id),
        cause_of_death || null
      ]
    );

    res.status(201).json({
      message: 'Postmortem exam details saved successfully',
      postmortem_id: result.insertId
    });
  } catch (error) {
    console.error('Error saving postmortem exam details:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
