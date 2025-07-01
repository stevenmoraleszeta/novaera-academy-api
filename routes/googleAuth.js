const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebaseAdmin');
const router = express.Router();

// Inicia el login con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
    try {
        // Genera el token JWT tradicional
        const user = req.user;
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
                lastname1: user.lastname1,
                photourl: user.photourl
            });
        } catch (firebaseError) {
            console.error('Error generando Firebase custom token:', firebaseError);
        }

        // Envía HTML que cierra el popup y envía los tokens al padre
        res.send(`
            <script>
                // Envía los tokens a la ventana padre
                window.opener.postMessage({
                    type: 'GOOGLE_AUTH_SUCCESS',
                    token: '${token}',
                    firebaseToken: '${firebaseToken || ''}',
                    user: ${JSON.stringify({
            userId: user.userid,
            email: user.email,
            firstname: user.firstname,
            lastname1: user.lastname1,
            roleId: user.roleid,
            photourl: user.photourl
        })}
                }, '*');
                
                // Cierra el popup
                window.close();
            </script>
        `);
    } catch (error) {
        console.error('Error en Google callback:', error);
        res.status(500).send('Error en la autenticación');
    }
});

module.exports = router;