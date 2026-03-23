import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { addRecipeSchema, recipeParamSchema, recipesService } from "@/recipes";

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
}

export const recipesController = new RecipesController();
