import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import {
  addIngredientSchema,
  editIngredientSchema,
  ingredientParamSchema,
  ingredientsService,
} from "@/ingredients";

class IngredientsController {
  addIngredient = asyncErrorHandler(async (req: Request, res: Response) => {
    const addIngredientDto = addIngredientSchema.parse(req.body);
    const newIngredient =
      await ingredientsService.addIngredient(addIngredientDto);
    res.status(201).json(newIngredient);
  });

  editIngredient = asyncErrorHandler(async (req: Request, res: Response) => {
    const { ingredientId } = ingredientParamSchema.parse(req.params);
    const editIngredientDTO = editIngredientSchema.parse(req.body);
    const updatedIngredient = await ingredientsService.editIngredient(
      ingredientId,
      editIngredientDTO,
    );
    res.status(200).json(updatedIngredient);
  });

  removeIngredient = asyncErrorHandler(async (req: Request, res: Response) => {
    const { ingredientId } = ingredientParamSchema.parse(req.params);
    await ingredientsService.deleteIngredient(ingredientId);
    res.status(204).send();
  });

  getIngredient = asyncErrorHandler(async (req: Request, res: Response) => {
    const { ingredientId } = ingredientParamSchema.parse(req.params);
    const ingredient = await ingredientsService.getIngredient(ingredientId);
    res.status(200).json(ingredient);
  });

  getIngredients = asyncErrorHandler(async (req: Request, res: Response) => {
    const ingredients = await ingredientsService.getIngredients();
    res.status(200).json(ingredients);
  });
}

export const ingredientsController = new IngredientsController();
