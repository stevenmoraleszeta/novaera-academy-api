const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentProfilesController');

router.post('/', controller.insertStudentProfile);
router.get('/', controller.getStudentProfiles);
router.put('/:userId', controller.updateStudentProfile);
router.delete('/:userId', controller.deleteStudentProfile);

module.exports = router;
