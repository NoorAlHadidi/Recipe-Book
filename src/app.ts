import express, { Application } from 'express';
import { loggerMiddleware } from '@/middlewares';
import { globalErrorHandler } from '@/errors';
import { setupSwagger } from '@/config';
import { router } from '@/routes';
import { authRouter } from '@/auth';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for logging
app.use(loggerMiddleware);

// TODO: register routes here
app.use('/check', router);
app.use('/auth', authRouter); 

app.use(globalErrorHandler);

setupSwagger(app);

export default app;