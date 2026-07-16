import { Router } from "express";
import passport from "passport";

const ssoRouter = Router();

ssoRouter.get('/', (req, res) => {
    console.log('Session in success route', req.session);
    if (req.session && req.session.passport && req.session.passport.user) {
        res.send(`Authentication successful! Session ID: ${req.sessionID}`);
    } else {
        res.send('<a href="/auth/google">Login with Google</a>');
    }
});

ssoRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

ssoRouter.get('/auth/google/callback',
    (req, res, next) => {
        console.log('Auth callback hit', req.headers.cookie);
        next();
    },
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/failure',
    })
);
ssoRouter.get('/auth/success', (req, res) => {
    console.log('Session in success route', req.session);
    res.send(`Authentication successful! Session ID: ${req.sessionID}`);
});

    // A route for authentication failure
ssoRouter.get('/auth/failure', (req, res) => {
    res.send('Something went wrong...');
});

export default ssoRouter;