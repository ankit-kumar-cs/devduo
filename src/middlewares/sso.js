import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createRedisStore } from '../redis/store.js';
import session from 'express-session';
import { COOKIE_CONFIG } from '../config/cookieConfig.js';
import { connectRedis } from '../redis/store.js';
import { User } from '../models/User.js';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';


const LocalStrategy = OAuth2Strategy.Strategy;

class LinkedInStrategy extends OAuth2Strategy {
    constructor(options, verify) {
        const opts = {
            ...options,
            authorizationURL: options.authorizationURL || 'https://www.linkedin.com/oauth/v2/authorization',
            tokenURL: options.tokenURL || 'https://www.linkedin.com/oauth/v2/accessToken',
            scope: options.scope || ['openid', 'profile', 'email']
        };
        super(opts, verify);
        this.name = 'linkedin';
        this._oauth2.setAccessTokenName("oauth2_access_token");
    }

    userProfile(accessToken, done) {
        this._oauth2.get('https://api.linkedin.com/v2/userinfo', accessToken, (err, body) => {
            if (err) return done(new Error('failed to fetch user profile'));
            try {
                const json = JSON.parse(body);
                done(null, json);
            } catch(e) {
                done(new Error('failed to parse profile response'));
            }
        });
    }
}


export const configurePassport = async (app) => {
    const client = await connectRedis();
    app.use(
        session({
            name: 'devduo',
            store: createRedisStore(client, 'devduo:'),
            secret: process.env.TOKEN_SECRET || 'devduo-secret',
            resave: false,
            saveUninitialized: false,
            cookie: COOKIE_CONFIG,
            expires: new Date(Date.now() + 1000 * 20), // 1 day
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LinkedInStrategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: "/auth/linkedin/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
        console.log('LinkedIn profile:', profile);
        console.log('LinkedIn accessToken:', accessToken);
        console.log('LinkedIn refreshToken:', refreshToken);
        

        const user = await User.findOne({ email: profile.email });
        if (user) {
            console.log('User found:', user);
            return done(null, { ...user.toObject(), authType: 'linkedin' });
        }
        else {
            const newUser = await User.create({
                authId: profile.id,
                displayName: profile.givenName + ' ' + profile.familyName,
                username: profile.email,
                email: profile.email,
                photo: profile.picture,
                emailVerified: profile.email_verified || false
            });
            console.log('New user created:', newUser);
            return done(null, {...newUser, authType: 'linkedin'});
        }

        // Here you would typically find or create a user in your database
        // For this example, we'll just return the profile
        return done(null, profile);
    }
    ));

    passport.use(new GoogleStrategy.Strategy({
        clientID: process.env.GOOGLE_SSO_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SSO_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async function(accessToken, refreshToken, profile, done) {

        const user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            console.log('User found:', user);
            return done(null, { ...user.toObject(), authType: 'google' });
        }
        else {
            const newUser = await User.create({
                authId: profile.id,
                displayName: profile.displayName,
                username: profile.emails[0].value,
                email: profile.emails[0].value,
                photo: profile.photos[0].value,
                emailVerified: profile.emails[0].verified || false
            });
            console.log('New user created:', newUser);
            return done(null, {...newUser, authType: 'google'});
        }

        // Here you would typically find or create a user in your database
        // For this example, we'll just return the profile
        return done(null, profile);
    }
    ));

    passport.serializeUser((user, done) => {
        console.log('Serializing user:', user);
        const authInfo = {
            email: user.email,
            authType: user.authType
        }
        done(null, authInfo);
    });

    passport.deserializeUser((obj, done) => {
        console.log('Deserializing user:', obj);
        done(null, obj);
    });

    app.use((req, res, next) => {
        console.log('Incoming request req.user', req.user);
        console.log('Incoming request req.user', req.session);
        next();
    });
}