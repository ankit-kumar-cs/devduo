import { Router } from "express";
import passport from "passport";

const ssoRouter = Router();

ssoRouter.get('/', (req, res) => {
    console.log('Session in success route', req.session);
    if (req.session && req.session.passport && req.session.passport.user) {
        res.send(`Authentication successful! Session ID: ${req.sessionID}`);
    } else {
        res.send('<a href="/auth/google">Login with Google</a><br><a href="/auth/linkedin">Login with LinkedIn</a>');
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

ssoRouter.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ["openid", "profile", "email"]}));

ssoRouter.get('/auth/linkedin/callback',
    (req, res, next) => {
        console.log('Auth callback hit', req.headers.cookie);
        next();
    },
    passport.authenticate('linkedin', {
        successRedirect: '/',
        failureRedirect: '/auth/failure',
    })
);
ssoRouter.get('/auth/success', (req, res) => {
    console.log('Session in success route', req.session);
    res.send(`Authentication successful! Session ID: ${req.sessionID}`);
});

ssoRouter.get('/auth/failure', (req, res) => {
    res.send('Something went wrong...');
});

export default ssoRouter;