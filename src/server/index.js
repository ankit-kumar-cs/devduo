import express from 'express';
import { connectToDB } from '../db/connect.js';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const app = new express();
app.listen(3000, async () => {
    await connectToDB();
    await new User({
        name: 'Ankit',
        emailVerified: true,
        username: 'ankit.kumar@metacube.com'
    }).save()
    console.log('Server is up and running on 3000')
})

