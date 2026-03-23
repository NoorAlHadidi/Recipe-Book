import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { addRecipeSchema, editRecipeSchema, recipeParamSchema, recipesService } from "@/recipes";

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
    const updatedRecipe = await recipesService.editRecipe(recipeId, userId, editRecipeDTO
    );
    res.status(200).json(updatedRecipe);
  });  
}

export const recipesController = new RecipesController();
