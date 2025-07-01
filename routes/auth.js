const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/request-password-reset', controller.requestPasswordReset);
router.post('/reset-password', controller.resetPassword);
router.put('/change-password', controller.changePassword);
router.post('/firebase-token', controller.getFirebaseToken);

module.exports = router; 