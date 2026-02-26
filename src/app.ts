import express, { Application } from 'express';
import { loggerMiddleware } from '@/middlewares';
import { setupSwagger } from '@/config';
import { router } from '@/routes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for logging
app.use(loggerMiddleware);

// TODO: register routes here
app.use('/check', router);

setupSwagger(app);

export default app;