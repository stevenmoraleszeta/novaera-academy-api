const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');

router.post('/', controller.insertUser);
router.get('/', controller.getUsers);
router.put('/:userId', controller.updateUser);
router.delete('/:userId', controller.deleteUser);

module.exports = router;
