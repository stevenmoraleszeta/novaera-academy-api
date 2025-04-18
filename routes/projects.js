const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectsController');

router.post('/', controller.insertProject);
router.get('/', controller.getProjects);
router.put('/:projectId', controller.updateProject);
router.delete('/:projectId', controller.deleteProject);
router.get('/course/:courseId', controller.getProjectsByCourse);

module.exports = router;
