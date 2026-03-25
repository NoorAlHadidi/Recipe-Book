import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import {
  addRecipeSchema,
  editRecipeSchema,
  addRecipeStepsSchema,
  recipeParamSchema,
  recipeQueryParamsSchema,
  recipesService,
  recipeStepsService,
  editRecipeStepSchema,
  recipeStepParamSchema,
} from "@/recipes";

class RecipesController {
  addRecipe = asyncErrorHandler(async (req: Request, res: Response) => {
    const addRecipeDTO = addRecipeSchema.parse(req.body);
    const userId = req.user!.sub;
    const newRecipe = await recipesService.addRecipe(userId, addRecipeDTO);
    res.status(201).json(newRecipe);
  });

  removeRecipe = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    await recipesService.deleteRecipe(userId, recipeId);
    res.status(204).send();
  });

  editRecipe = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const editRecipeDTO = editRecipeSchema.parse(req.body);
    const updatedRecipe = await recipesService.editRecipe(
      userId,
      recipeId,
      editRecipeDTO,
    );
    res.status(200).json(updatedRecipe);
  });

  getRecipe = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const recipe = await recipesService.getRecipe(userId, recipeId);
    res.status(200).json(recipe);
  });

  getRecipes = asyncErrorHandler(async (req: Request, res: Response) => {
    const recipeQueryParams = recipeQueryParamsSchema.parse(req.query);
    const userId = req.user!.sub;
    const recipes = await recipesService.getRecipes(userId, recipeQueryParams);
    res.status(200).json(recipes);
  });

  addRecipeSteps = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const addRecipeStepsDTO = addRecipeStepsSchema.parse(req.body);
    const recipeSteps = await recipeStepsService.addSteps(
      userId,
      recipeId,
      addRecipeStepsDTO,
    );
    res.status(201).json(recipeSteps);
  });

  editRecipeStep = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId, stepNumber } = recipeStepParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const editRecipeStepDTO = editRecipeStepSchema.parse(req.body);
    const recipeSteps = await recipeStepsService.editStep(
      userId,
      recipeId,
      stepNumber,
      editRecipeStepDTO,
    );
    res.status(200).json(recipeSteps);
  });
}

export const recipesController = new RecipesController();
