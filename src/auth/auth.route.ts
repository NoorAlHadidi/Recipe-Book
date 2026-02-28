import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticateToken } from "@/middlewares";

export const authRouter = Router();

/**
 * @swagger
 * /auth/register:
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
authRouter.post("/register", authController.signUp);

/**
 * @swagger
 * /auth/login:
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
authRouter.post("/login", authController.logIn);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Endpoint for user log-out
 *     security:
 *          - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Log-out successful
 */
authRouter.post("/logout", authenticateToken, authController.logOut);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Endpoint to refresh access token using a valid refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully, returns new access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  accessToken:
 *                      type: string
 */
authRouter.post("/refresh", authController.refreshTokens);

export default authRouter;