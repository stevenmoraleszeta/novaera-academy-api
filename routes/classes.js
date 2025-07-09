const express = require('express');
const router = express.Router();
const {
    classValidations,
    updateClassValidations,
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    getClassById,
    getClassesByCourseModule
} = require('../controllers/classesController');

router.get('/', getClasses);
router.post('/', classValidations, createClass);
router.put('/:id', updateClassValidations, updateClass);
router.delete('/:id', deleteClass);
router.get('/:id', getClassById);
router.get('/by-course-module/:courseId/:moduleId', getClassesByCourseModule);

module.exports = router;