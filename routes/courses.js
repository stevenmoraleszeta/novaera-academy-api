const express = require('express');
const router = express.Router();
const controller = require('../controllers/coursesController');

router.post('/', controller.insertCourse);
router.get('/', controller.getCourses);
router.put('/:courseId/mentor', controller.updateCourseMentor);
router.put('/:courseId', controller.updateCourse);
router.delete('/:courseId', controller.deleteCourse);
router.get('/search', controller.searchCoursesByTitle);
router.get('/category-name/:name', controller.getCoursesByCategoryName);
router.get('/:courseId', controller.getCourseById);


module.exports = router;
