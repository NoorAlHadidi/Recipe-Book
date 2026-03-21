import express, { Application } from 'express';
import { loggerMiddleware } from '@/middlewares';
import { globalErrorHandler } from '@/errors';
import { setupSwagger } from '@/config';
import { router } from '@/routes';
import { authRouter } from '@/auth';
import { adminRouter } from '@/admins';
import { categoriesRouter } from '@/categories';
import { ingredientsRouter } from '@/ingredients';
import { unitsRouter } from '@/units';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for logging
app.use(loggerMiddleware);

// TODO: register routes here
app.use('/check', router);
app.use('/auth', authRouter); 
app.use('/admin', adminRouter); 
app.use('/category', categoriesRouter)
app.use('/ingredients', ingredientsRouter)
app.use('/units', unitsRouter)

app.use(globalErrorHandler);

setupSwagger(app);

export default app;