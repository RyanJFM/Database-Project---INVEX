const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');

router.get('/case/:case_id', evidenceController.getEvidenceByCase);
router.post('/', evidenceController.createEvidence);

module.exports = router;
