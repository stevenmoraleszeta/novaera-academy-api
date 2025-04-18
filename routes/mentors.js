const express = require('express');
const router = express.Router();
const controller = require('../controllers/mentorsController');

router.post('/', controller.insertMentor);
router.get('/', controller.getMentors);
router.put('/:mentorId', controller.updateMentor);
router.delete('/:mentorId', controller.deleteMentor);

module.exports = router;
