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
 *               tagNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                      - ingredientId
 *                      - quantity
 *                      - unitId
 *                   properties:
 *                      ingredientId:
 *                          type: number
 *                      quantity:
 *                          type: number
 *                      unitId:
 *                          type: number
 *                      notes:
 *                          type: string
 *               steps:
 *                 type: array
 *                 items:
 *                   type: string
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

/**
 * @swagger
 * /recipes/{recipeId}:
 *   delete:
 *     summary: Endpoint for removing an exisiting recipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       204:
 *         description: Recipe deleted successfully
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
 *       403:
 *         description: Authenticated user is not the recipe creator (Not allowed to delete)
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
 *         description: Recipe not found
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
recipesRouter.delete(
  "/:recipeId",
  authenticateToken,
  recipesController.removeRecipe,
);

/**
 * @swagger
 * /recipes/{recipeId}:
 *   patch:
 *     summary: Endpoint for updating an exisiting recipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               tagNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                      - ingredientId
 *                      - quantity
 *                      - unitId
 *                   properties:
 *                      ingredientId:
 *                          type: number
 *                      quantity:
 *                          type: number
 *                      unitId:
 *                          type: number
 *                      notes:
 *                          type: string
 *     responses:
 *       200:
 *         description: Recipe updated successfully
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
 *                   nullable: true
 *                 visibility:
 *                   type: string
 *                   enum: [public, private]
 *                 creatorId:
 *                   type: number
 *                 categoryId:
 *                   type: number
 *                 createdAt:
 *                   type: number
 *                   format: date-time
 *                 updatedAt:
 *                   type: number
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
 *       403:
 *         description: Authenticated user is not the recipe creator (Not allowed to update)
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
 *         description: Recipe or update category not found
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
recipesRouter.patch(
  "/:recipeId",
  authenticateToken,
  recipesController.editRecipe,
);

/**
 * @swagger
 * /recipes/{recipeId}:
 *   get:
 *     summary: Endpoint for retrieving a single recipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
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
 *                   nullable: true
 *                 visibility:
 *                   type: string
 *                   enum: [public, private]
 *                 creatorId:
 *                   type: number
 *                 categoryId:
 *                   type: number
 *                 createdAt:
 *                   type: number
 *                   format: date-time
 *                 updatedAt:
 *                   type: number
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
 *       403:
 *         description: Authenticated user is not allowed to view this recipe
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
 *         description: Recipe not found
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
recipesRouter.get("/:recipeId", authenticateToken, recipesController.getRecipe);

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Endpoint for filtering and retrieving recipes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: creatorId
 *         required: false
 *         schema:
 *           type: number
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: number
 *       - in: query
 *         name: tagId
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Recipes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 total:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                      type: object
 *                      properties:
 *                        recipeId:
 *                          type: number
 *                        title:
 *                          type: string
 *                        description:
 *                          type: string
 *                          nullable: true
 *                        visibility:
 *                          type: string
 *                          enum: [public, private]
 *                        creatorId:
 *                          type: number
 *                        categoryId:
 *                          type: number
 *                        createdAt:
 *                          type: number
 *                          format: date-time
 *                        updatedAt:
 *                          type: number
 *                          format: date-time
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
recipesRouter.get("/", authenticateToken, recipesController.getRecipes);

/**
 * @swagger
 * /recipes/{recipeId}/steps:
 *   post:
 *     summary: Endpoint for adding new steps to a recipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - steps
 *             properties:
 *               steps:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: New steps added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               properties:
 *                 stepNumber:
 *                   type: number
 *                 stepInstruction:
 *                   type: string
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
 *       403:
 *         description: Authenticated user is not the recipe creator (Not allowed to add steps)
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
 *         description: Recipe with specified ID is not found
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
recipesRouter.post(
  "/:recipeId/steps",
  authenticateToken,
  recipesController.addRecipeSteps,
);

/**
 * @swagger
 * /recipes/{recipeId}/steps/{stepNumber}:
 *   patch:
 *     summary: Endpoint for editting a step instruction for a recipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instruction:
 *                 type: string
 *     responses:
 *       200:
 *         description: Step editted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               properties:
 *                 stepNumber:
 *                   type: number
 *                 stepInstruction:
 *                   type: string
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
 *       403:
 *         description: Authenticated user is not the recipe creator (Not allowed to edit steps)
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
 *         description: Recipe with specified ID is not found / Step is not found in specified recipe
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
recipesRouter.patch(
  "/:recipeId/steps/:stepNumber",
  authenticateToken,
  recipesController.editRecipeStep,
);

/**
 * @swagger
 * /recipes/{recipeId}/steps/{stepNumber}:
 *   delete:
 *     summary: Endpoint for deleting a step in a recipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Step deleted successfully
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
 *       403:
 *         description: Authenticated user is not the recipe creator (Not allowed to delete steps)
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
 *         description: Recipe with specified ID is not found / Step is not found in specified recipe
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
recipesRouter.delete(
  "/:recipeId/steps/:stepNumber",
  authenticateToken,
  recipesController.deleteRecipeStep,
);
export default recipesRouter;
