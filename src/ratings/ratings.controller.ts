import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { addRatingSchema, ratingsService } from "@/ratings";
import { recipeParamSchema } from "@/recipes";

class RatingsController {
  addRating = asyncErrorHandler(async (req: Request, res: Response) => {
    const addRatingDTO = addRatingSchema.parse(req.body);
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const newRating = await ratingsService.addRating(userId, recipeId, addRatingDTO);
    res.status(201).json(newRating);
  });

  removeRating = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    await ratingsService.deleteRating(userId, recipeId);
    res.status(204).send();
  });

  getRecipeRatings = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const ratings = await ratingsService.getRatings(recipeId);
    res.status(200).json(ratings);
  });
}

export const ratingsController = new RatingsController();
