const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectStatusesController');

router.post('/', controller.insertProjectStatus);
router.get('/', controller.getProjectStatuses);
router.put('/:id', controller.updateProjectStatus);
router.delete('/:id', controller.deleteProjectStatus);

module.exports = router;
