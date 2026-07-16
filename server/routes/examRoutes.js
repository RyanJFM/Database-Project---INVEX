const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

router.post('/clinical', examController.createClinicalExam);
router.post('/postmortem', examController.createPostmortemExam);

module.exports = router;
