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
    // Redirige al frontend con el token
    res.redirect(`http://localhost:3000/login?token=${token}`);
});

module.exports = router;