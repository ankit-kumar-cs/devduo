import { Router } from "express";
import passport from "passport";

const ssoRouter = Router();

const renderAuthPage = ({ title, intro, form, footer, error = '' }) => `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title} · DevDuo</title>
    <style>
        :root {
            color-scheme: light;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #f5f7ff;
            color: #172033;
        }

        * { box-sizing: border-box; }

        body {
            min-height: 100vh;
            margin: 0;
            display: grid;
            place-items: center;
            padding: 2rem 1rem;
            background:
                radial-gradient(circle at 8% 10%, #dce8ff 0, transparent 32rem),
                radial-gradient(circle at 95% 95%, #d9f8ed 0, transparent 28rem),
                #f7f8fc;
        }

        .sign-in-card {
            width: min(100%, 27rem);
            padding: 2.5rem;
            background: rgba(255, 255, 255, .94);
            border: 1px solid #e6e9f2;
            border-radius: 1.25rem;
            box-shadow: 0 1.25rem 3.75rem rgba(32, 48, 86, .12);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: .7rem;
            font-size: 1.15rem;
            font-weight: 800;
            letter-spacing: -.03em;
        }

        .brand-mark {
            display: grid;
            place-items: center;
            width: 2.1rem;
            height: 2.1rem;
            border-radius: .65rem;
            color: #fff;
            background: #4c5bff;
            box-shadow: .2rem .25rem 0 #cfd4ff;
        }

        h1 { margin: 2rem 0 .45rem; font-size: 1.75rem; letter-spacing: -.04em; }
        .intro { margin: 0 0 1.75rem; color: #667085; line-height: 1.55; }
        .field { display: grid; gap: .48rem; margin-bottom: 1rem; }
        label { font-size: .9rem; font-weight: 650; }

        input {
            width: 100%;
            min-height: 3rem;
            padding: .75rem .85rem;
            border: 1px solid #cfd5e3;
            border-radius: .65rem;
            outline: none;
            color: inherit;
            font: inherit;
            transition: border-color .15s, box-shadow .15s;
        }

        input:focus { border-color: #4c5bff; box-shadow: 0 0 0 .22rem #e1e4ff; }
        button, .provider {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 3rem;
            border-radius: .65rem;
            font: inherit;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
        }

        button { border: 0; color: #fff; background: #4c5bff; margin-top: .5rem; }
        button:hover { background: #3d4cf2; }
        .divider { display: flex; align-items: center; gap: .75rem; margin: 1.5rem 0; color: #98a2b3; font-size: .8rem; }
        .divider::before, .divider::after { content: ""; height: 1px; flex: 1; background: #e5e7eb; }
        .providers { display: grid; gap: .75rem; }
        .provider { gap: .6rem; border: 1px solid #d8dce6; color: #344054; background: #fff; }
        .provider:hover { background: #f8f9fc; border-color: #bdc4d4; }
        .google { color: #4285f4; font-size: 1.15rem; font-weight: 800; }
        .linkedin { color: #0a66c2; font-size: 1.1rem; font-weight: 900; }
        .error { margin: 0 0 1rem; padding: .75rem .9rem; border-radius: .6rem; color: #a51d2d; background: #fff0f1; font-size: .9rem; }
        .footer { margin: 1.5rem 0 0; color: #98a2b3; font-size: .78rem; line-height: 1.45; text-align: center; }
        .footer a { color: #4c5bff; font-weight: 700; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }

        @media (max-width: 420px) { .sign-in-card { padding: 1.75rem 1.25rem; } }
    </style>
</head>
<body>
    <main class="sign-in-card">
        <div class="brand"><span class="brand-mark">&lt;/&gt;</span> DevDuo</div>
        <h1>${title}</h1>
        <p class="intro">${intro}</p>
        ${error ? `<p class="error" role="alert">${error}</p>` : ''}
        ${form}
        <p class="footer">${footer}</p>
    </main>
</body>
</html>`;

const socialProviders = `
    <div class="divider">or continue with</div>
    <div class="providers">
        <a class="provider" href="/auth/google"><span class="google">G</span> Continue with Google</a>
        <a class="provider" href="/auth/linkedin"><span class="linkedin">in</span> Continue with LinkedIn</a>
    </div>`;

const renderLoginPage = ({ error = '' } = {}) => renderAuthPage({
    title: 'Welcome back',
    intro: 'Sign in to continue building with your developer community.',
    error,
    form: `
        <form method="post" action="/auth/local">
            <div class="field">
                <label for="username">Username or email</label>
                <input id="username" name="username" type="text" autocomplete="username" required>
            </div>
            <div class="field">
                <label for="password">Password</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required>
            </div>
            <button type="submit">Sign in</button>
        </form>${socialProviders}`,
    footer: 'New to DevDuo? <a href="/signup">Create an account</a>'
});

const renderSignupPage = () => renderAuthPage({
    title: 'Create your account',
    intro: 'Join DevDuo and connect with developers who build.',
    form: `
        <form method="post" action="/signup">
            <div class="field">
                <label for="name">Name</label>
                <input id="name" name="name" type="text" autocomplete="name" required>
            </div>
            <div class="field">
                <label for="username">Username or email</label>
                <input id="username" name="username" type="text" autocomplete="username" required>
            </div>
            <div class="field">
                <label for="password">Password</label>
                <input id="password" name="password" type="password" autocomplete="new-password" required>
            </div>
            <button type="submit">Create account</button>
        </form>${socialProviders}`,
    footer: 'Already have an account? <a href="/">Sign in</a>'
});

ssoRouter.get('/', (req, res) => {
    console.log('Session in success route', req.session);
    if (req.session && req.session.passport && req.session.passport.user) {
        res.send(`Authentication successful! Session ID: ${req.sessionID}`);
    } else {
        res.type('html').send(renderLoginPage());
    }
});

ssoRouter.get('/signup', (req, res) => {
    res.type('html').send(renderSignupPage());
});

ssoRouter.post('/signup', (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).type('html').send(renderSignupPage({
            error: 'Please fill in all the required fields.'
        }));
    }

    
    res.redirect('/');
});

ssoRouter.post('/auth/local', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).type('html').send(renderLoginPage({
            error: 'Enter both your username and password to sign in.'
        }));
    }

    // Local credential verification can be connected here when local accounts are added.
    return res.status(401).type('html').send(renderLoginPage({
        error: 'The username or password you entered is incorrect.'
    }));
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
