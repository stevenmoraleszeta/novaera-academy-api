const express = require('express');
const router = express.Router();
const controller = require('../controllers/courseFeaturesController');

router.post('/', controller.insertCourseFeature);
router.get('/', controller.getCourseFeatures);
router.put('/:id', controller.updateCourseFeature);
router.delete('/:id', controller.deleteCourseFeature);
router.get('/by-course/:courseId', controller.getCourseFeaturesByCourseId);
router.put('/order/:id', controller.updateCourseFeatureOrder);

module.exports = router;
