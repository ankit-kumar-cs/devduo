import { Router } from "express";
const homeRouter = Router();

homeRouter.get('/home', (req, res) => {
    res.send('Welcome to the Home Page');
});

export { homeRouter };