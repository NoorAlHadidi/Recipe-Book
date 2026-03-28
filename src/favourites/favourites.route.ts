import { Router } from "express";
import { favouritesController } from "@/favourites";
import { authenticateToken } from "@/middlewares";

export const favouritesRouter = Router();

/**
 * @swagger
 * /favourites:
 *   get:
 *     summary: Endpoint for retrieving a user's favourited recipes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favourited recipes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               properties:
 *                 recipeId:
 *                   type: number
 *                 recipeTitle:
 *                   type: string
 *                 favouritedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                 details:
 *                   type: object
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 */
favouritesRouter.get("/", authenticateToken, favouritesController.getUserFavourites);

export default favouritesRouter;
