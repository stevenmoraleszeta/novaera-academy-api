const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentProjectsController');

router.post('/', controller.insertStudentProject);
router.get('/', controller.getStudentProjects);
router.get('/submission/:projectId/:userId', controller.getStudentSubmission);
router.put('/:studentProjectId', controller.updateStudentProject);
router.delete('/:studentProjectId', controller.deleteStudentProject);
router.get('/student-name/:name', controller.searchStudentProjectsByStudentName);
router.get('/status-name/:name', controller.getStudentProjectsByStatusName);
router.post('/submit/:projectId', controller.submitStudentProject);

module.exports = router;
