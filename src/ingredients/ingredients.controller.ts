import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import {
  addIngredientSchema,
  editIngredientSchema,
  addIngredientUnitSchema,
  ingredientParamSchema,
  ingredientUnitParamSchema,
  ingredientsService,
  ingredientQueryParamsSchema,
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
    const ingredientQueryParams = ingredientQueryParamsSchema.parse(req.query);
    const ingredients = await ingredientsService.getIngredients(
      ingredientQueryParams,
    );
    res.status(200).json(ingredients);
  });

  addIngredientUnit = asyncErrorHandler(async (req: Request, res: Response) => {
    const { ingredientId } = ingredientParamSchema.parse(req.params);
    const addIngredientUnitDTO = addIngredientUnitSchema.parse(req.body);
    const newIngredientUnit = await ingredientsService.addIngredientUnit(
      ingredientId,
      addIngredientUnitDTO,
    );
    res.status(201).json(newIngredientUnit);
  });

  getIngredientUnits = asyncErrorHandler(
    async (req: Request, res: Response) => {
      const { ingredientId } = ingredientParamSchema.parse(req.params);
      const ingredientUnits =
        await ingredientsService.getIngredientUnits(ingredientId);
      res.status(200).json(ingredientUnits);
    },
  );

  removeIngredientUnit = asyncErrorHandler(
    async (req: Request, res: Response) => {
      const { ingredientId, unitId } = ingredientUnitParamSchema.parse(
        req.params,
      );
      await ingredientsService.deleteIngredientUnit(ingredientId, unitId);
      res.status(204).send();
    },
  );
}

export const ingredientsController = new IngredientsController();
