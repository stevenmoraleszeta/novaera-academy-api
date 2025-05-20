const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentCoursesController');

router.post('/', controller.insertStudentCourse);
router.get('/', controller.getStudentCourses);
router.get('/:id', controller.getStudentCoursesById);
router.get('/by-course/:courseId', controller.getStudentCoursesByCourse);
router.put('/:id', controller.updateStudentCourse);
router.delete('/:id', controller.deleteStudentCourse);

module.exports = router;
