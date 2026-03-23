import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { addRecipeSchema, recipesService } from "@/recipes";

class RecipesController {
  addRecipe = asyncErrorHandler(async (req: any, res: Response) => {
    const addRecipeDTO = addRecipeSchema.parse(req.body);
    const userId = req.user?.sub;
    const newRecipe = await recipesService.addRecipe(userId, addRecipeDTO);
    res.status(201).json(newRecipe);
  });
}

export const recipesController = new RecipesController();
