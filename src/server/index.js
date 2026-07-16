import express from 'express';
import { connectToDB } from '../db/connect.js';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { connectRedis } from '../redis/store.js';
import ssoRouter from '../routers/sso.js';
import { configurePassport } from '../middlewares/sso.js';
import { homeRouter } from '../routers/home.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
    await configurePassport(app);
    app.use(ssoRouter);
    app.use(homeRouter);

    app.listen(3000, async () => {
        await connectToDB();
        console.log('Server is up and running on 3000');
    });
};

startServer();

