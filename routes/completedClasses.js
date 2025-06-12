const express = require('express');
const router = express.Router();
const {
    getCompletedClassesByUser,
    updateCompletedClasses
} = require('../controllers/completedClassesController');

// GET: obtener clases completadas de un usuario
router.get('/:userid/completed-classes', getCompletedClassesByUser);

// PUT: actualizar clases completadas de un usuario
router.put('/:userid/completed-classes', updateCompletedClasses);

module.exports = router;
