const express = require('express');
const router = express.Router();
const {
    classValidations,
    getClasses,
    createClass,
    updateClass,
    deleteClass
} = require('../controllers/classesController');

router.get('/', getClasses);
router.post('/', classValidations, createClass);
router.put('/:id', classValidations, updateClass);
router.delete('/:id', deleteClass);

module.exports = router;