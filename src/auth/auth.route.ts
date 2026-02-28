import { Router } from "express";
import { authController } from "./auth.controller";

export const authRouter = Router();

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Endpoint for user sign-up
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: 
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  userId:
 *                      type: integer
 *                  firstName:
 *                      type: string
 *                  lastName:
 *                      type: string
 *                  email:
 *                      type: string
 * 
 */
authRouter.post("/sign-up", authController.signUp);

/**
 * @swagger
 * /auth/log-in:
 *   post:
 *     summary: Endpoint for user log-in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Log-in successful, returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  accessToken:
 *                      type: string
 *                  refreshToken:
 *                      type: string
 */
authRouter.post("/log-in", authController.logIn);

export default authRouter;