import express, { Application } from 'express';
import { loggerMiddleware } from '@/middlewares';
import { setupSwagger } from '@/config';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for logging
app.use(loggerMiddleware);

// TODO: register routes here

setupSwagger(app);

export default app;