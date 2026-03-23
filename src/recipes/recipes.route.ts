import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { recipesController } from "@/recipes";

export const recipesRouter = Router();

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Endpoint for adding a new recipe
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *               categoryId:
 *                 type: number
 *     responses:
 *       201:
 *         description: New recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recipeId:
 *                   type: number
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 visibility:
 *                   type: string
 *                   enum: [public, private]
 *                 categoryId:
 *                   type: number
 *                 creatorId:
 *                   type: number 
 *                 createdAt:
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
 *       404:
 *         description: Category with specified ID is not found
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
recipesRouter.post("/", authenticateToken, recipesController.addRecipe);

export default recipesRouter;
