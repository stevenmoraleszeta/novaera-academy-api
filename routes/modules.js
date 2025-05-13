const express = require('express');
const router = express.Router();
const controller = require('../controllers/modulesController');

router.post('/', controller.insertModule);
router.get('/', controller.getModules);
router.put('/:moduleId', controller.updateModule);
router.delete('/:moduleId', controller.deleteModule);
router.get('/course/:courseId', controller.getModulesByCourse);

module.exports = router;
