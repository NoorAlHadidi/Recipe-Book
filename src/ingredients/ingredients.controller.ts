import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import {
  addIngredientSchema,
  ingredientsService,
} from "@/ingredients";

class IngredientsController {
  addIngredient = asyncErrorHandler(async (req: Request, res: Response) => {
    const addIngredientDto = addIngredientSchema.parse(req.body);
    const newIngredient = await ingredientsService.addIngredient(addIngredientDto);
    res.status(201).json(newIngredient);
  });
}

export const ingredientsController = new IngredientsController();
