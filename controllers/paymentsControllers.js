const pool = require('../db');
const { validationResult, check } = require('express-validator');

const paymentValidations = [
    check('userId').notEmpty().withMessage('El ID de usuario es obligatorio'),
    check('amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0'),
    check('description').notEmpty().withMessage('La descripción es obligatoria'),
];

const createPayment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, amount, description, courseId, courseName, receiptNumber } = req.body;

        // Insertar pago
        const result = await pool.query(
            `INSERT INTO payments (userId, amount, description, courseId, courseName, receiptNumber, date)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
            [userId, amount, description, courseId || null, courseName || null, receiptNumber || null]
        );

        res.status(201).json({
            message: 'Pago registrado exitosamente',
            payment: result.rows[0]
        });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({
            error: 'Error al registrar el pago',
            details: error.message
        });
    }
};

const getPaymentsByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM payments WHERE userId = $1 ORDER BY date DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({
            error: 'Error al obtener los pagos',
            details: error.message
        });
    }
};


const getPaymentById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM payments WHERE paymentId = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener pago:', error);
        res.status(500).json({
            error: 'Error al obtener el pago',
            details: error.message
        });
    }
};

module.exports = {
    paymentValidations,
    createPayment,
    getPaymentsByUser,
    getPaymentById
};