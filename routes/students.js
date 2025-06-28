const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentController');

router.post('/', controller.insertStudent);
router.get('/', controller.getStudent);
router.put('/:userid', controller.updateStudent);
router.delete('/:userid', controller.deleteStudent);

module.exports = router;