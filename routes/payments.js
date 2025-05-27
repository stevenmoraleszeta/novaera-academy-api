const express = require('express');
const router = express.Router();
const {
    paymentValidations,
    createPayment,
    getPaymentsByUser,
    getPaymentById
} = require('../controllers/paymentsControllers');

router.post('/', paymentValidations, createPayment);
router.get('/user/:userId', getPaymentsByUser);
router.get('/:id', getPaymentById);

module.exports = router;