const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentCoursesController');

router.post('/', controller.insertStudentCourse);
router.get('/', controller.getStudentCourses);
router.get('/by-course/:courseId', controller.getStudentCoursesByCourse); // <-- esta primero
router.get('/:courseId/:id', controller.getStudentCoursesById);           // <-- esta después
router.put('/:id', controller.updateStudentCourse);
router.delete('/:id', controller.deleteStudentCourse);

module.exports = router;
