import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createRedisStore } from '../redis/store.js';
import session from 'express-session';
import { COOKIE_CONFIG } from '../config/cookieConfig.js';
import { connectRedis } from '../redis/store.js';
import { User } from '../models/User.js';

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
    passport.use(new GoogleStrategy.Strategy({
        clientID: process.env.GOOGLE_SSO_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SSO_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async function(accessToken, refreshToken, profile, done) {

        const user = await User.findOne({ googleId: profile.id });
        if (user) {
            console.log('User found:', user);
            return done(null, user);
        }
        else {
            const newUser = await User.create({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value
            });
            console.log('New user created:', newUser);
            return done(null, newUser);
        }

        // Here you would typically find or create a user in your database
        // For this example, we'll just return the profile
        return done(null, profile);
    }
    ));

    passport.serializeUser((user, done) => {
        console.log('Serializing user:', user);
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        console.log('Deserializing user:', obj);
        done(null, obj);
    });
}