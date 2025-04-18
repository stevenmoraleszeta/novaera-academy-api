const express = require('express');
const router = express.Router();
const controller = require('../controllers/rolesController');

router.post('/', controller.insertRole);
router.get('/', controller.getRoles);
router.put('/:id', controller.updateRole);
router.delete('/:id', controller.deleteRole);

module.exports = router;
