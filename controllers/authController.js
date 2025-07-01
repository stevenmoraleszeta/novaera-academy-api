const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const admin = require('../config/firebaseAdmin');

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email
        const userResult = await pool.query('SELECT * FROM sp_select_user_by_email($1)', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = userResult.rows[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token JWT tradicional
        const token = jwt.sign(
            {
                userId: user.userid,
                email: user.email,
                roleId: user.roleid
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Generar custom token de Firebase
        let firebaseToken = null;
        try {
            firebaseToken = await admin.auth().createCustomToken(user.userid.toString(), {
                email: user.email,
                roleId: user.roleid,
                firstname: user.firstname,
                lastname1: user.lastname1
            });
        } catch (firebaseError) {
            console.error('Error generando Firebase custom token:', firebaseError);
            // Continúa sin el token de Firebase si hay error
        }

        // Eliminar la contraseña del objeto de respuesta
        delete user.password;

        res.status(200).json({
            message: 'Login exitoso',
            token,
            firebaseToken,
            user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        // Obtener el token del header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(400).json({
                error: 'No se proporcionó token de autenticación',
                success: false
            });
        }

        res.status(200).json({
            message: 'Logout exitoso',
            success: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            success: false
        });
    }
};

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        // Verificar si el usuario existe
        const userResult = await pool.query('SELECT * FROM sp_select_user_by_email($1)', [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = userResult.rows[0];

        // Generar token de restablecimiento
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);

        // Guardar el token en la base de datos
        await pool.query('SELECT sp_update_reset_token($1, $2)', [user.userid, hashedToken]);

        // Crear enlace de restablecimiento
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Enviar correo electrónico
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Restablecimiento de contraseña',
            html: `
                <p>Hola,</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <a href="${resetLink}">Restablecer contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'Se ha enviado un correo con las instrucciones para restablecer la contraseña'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Buscar usuario con el token
        const userResult = await pool.query('SELECT * FROM sp_select_user_by_reset_token($1)', [token]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const user = userResult.rows[0];

        // Verificar si el token coincide
        const validToken = await bcrypt.compare(token, user.reset_token);

        if (!validToken) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña y limpiar token
        await pool.query('SELECT sp_update_password($1, $2)', [user.userid, hashedPassword]);
        await pool.query('SELECT sp_clear_reset_token($1)', [user.userid]);

        res.status(200).json({
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(403).json({ error: "Acceso denegado. Se requiere un token." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId; // Obtenemos el ID del usuario desde el token

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }

        const userResult = await pool.query('SELECT * FROM sp_select_user_by_id($1)', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('SELECT sp_update_password($1, $2)', [userId, hashedNewPassword]);

        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Generar solo Firebase custom token (para el frontend que quiera usar Firebase Auth)
const getFirebaseToken = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email
        const userResult = await pool.query('SELECT * FROM sp_select_user_by_email($1)', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = userResult.rows[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar solo custom token de Firebase
        const firebaseToken = await admin.auth().createCustomToken(user.userid.toString(), {
            email: user.email,
            roleId: user.roleid,
            firstname: user.firstname,
            lastname1: user.lastname1,
            photourl: user.photourl
        });

        res.status(200).json({
            firebaseToken,
            user: {
                userId: user.userid,
                email: user.email,
                firstname: user.firstname,
                lastname1: user.lastname1,
                roleId: user.roleid,
                photourl: user.photourl
            }
        });
    } catch (error) {
        console.error('Error generando Firebase custom token:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
    getFirebaseToken
};