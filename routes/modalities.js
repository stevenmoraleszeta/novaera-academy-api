const express = require('express');
const router = express.Router();
const controller = require('../controllers/modalitiesController');

router.post('/', controller.insertModality);
router.get('/', controller.getModalities);
router.put('/:id', controller.updateModality);
router.delete('/:id', controller.deleteModality);

module.exports = router;
