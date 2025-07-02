const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const pool = require('./db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
},
    async (accessToken, refreshToken, profile, done) => {
        // Busca o crea el usuario en la DB
        let user;
        let isNewUser = false; 
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const photoUrl = profile.photos[0].value;

        // Busca usuario por email
        const userResult = await pool.query('SELECT * FROM sp_select_user_by_email($1)', [email]);
        if (userResult.rows.length === 0) {
            isNewUser = true;
            const newUserResult = await pool.query(
                'SELECT * FROM sp_create_user_google($1, $2, $3)',
                [email, name, photoUrl]
            );
            user = newUserResult.rows[0];
        } else {
            user = userResult.rows[0];
        }
        user.isNewUser = isNewUser;
        return done(null, user);
    }));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});