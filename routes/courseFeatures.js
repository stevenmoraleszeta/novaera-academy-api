const express = require('express');
const router = express.Router();
const controller = require('../controllers/courseFeaturesController');

router.post('/', controller.insertCourseFeature);
router.get('/', controller.getCourseFeatures);
router.put('/:id', controller.updateCourseFeature);
router.delete('/:id', controller.deleteCourseFeature);

module.exports = router;
