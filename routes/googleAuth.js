const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Inicia el login con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    // Genera el token JWT
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

    // Envía HTML que cierra el popup y envía el token al padre
    res.send(`
        <script>
            // Envía el token a la ventana padre
            window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                token: '${token}',
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
});

module.exports = router;