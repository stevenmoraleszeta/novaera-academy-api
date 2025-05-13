const express = require('express');
const router = express.Router();
const {
    classValidations,
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    getClassById
} = require('../controllers/classesController');

router.get('/', getClasses);
router.post('/', classValidations, createClass);
router.put('/:id', classValidations, updateClass);
router.delete('/:id', deleteClass);
router.get('/:id', getClassById);

module.exports = router;