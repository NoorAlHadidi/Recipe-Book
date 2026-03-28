import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { favouritesService } from "@/favourites";
import { recipeParamSchema } from "@/recipes";

class FavouritesController {
  addFavourite = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    await favouritesService.addFavourite(userId, recipeId);
    res.status(201).send();
  });

  removeFavourite = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    await favouritesService.deleteFavourite(userId, recipeId);
    res.status(204).send();
  });

  getUserFavourites = asyncErrorHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const favourites = await favouritesService.getUserFavourites(userId);
    res.status(200).json(favourites);
  });

  getRecipeFavourites = asyncErrorHandler(
    async (req: Request, res: Response) => {
      const { recipeId } = recipeParamSchema.parse(req.params);
      const userId = req.user!.sub;
      const favouritedUsers = await favouritesService.getRecipeFavourites(
        userId,
        recipeId,
      );
      res.status(200).json(favouritedUsers);
    },
  );
}

export const favouritesController = new FavouritesController();
