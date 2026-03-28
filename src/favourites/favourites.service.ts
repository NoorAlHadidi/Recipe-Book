import {
  databaseClient,
  favouritesTable,
  recipesTable,
  usersTable,
} from "@/database";
import { eq, and, desc } from "drizzle-orm";
import { checkRecipeExists } from "@/recipes";
import { AppError } from "@/errors";

class FavouritesService {
  async addFavourite(userId: number, recipeId: number) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.visibility === "private") {
      throw new AppError("Private recipes cannot be favourited.", 403);
    }
    const existingFavourite = await databaseClient.db
      .select()
      .from(favouritesTable)
      .where(
        and(
          eq(favouritesTable.userId, userId),
          eq(favouritesTable.recipeId, recipeId),
        ),
      )
      .execute();
    if (existingFavourite.length > 0) {
      throw new AppError("User has already favourited this recipe.", 409);
    }
    await databaseClient.db
      .insert(favouritesTable)
      .values({ userId, recipeId })
      .returning()
      .execute();
  }

  async deleteFavourite(userId: number, recipeId: number) {
    await checkRecipeExists(recipeId);
    const existingFavourite = await databaseClient.db
      .select()
      .from(favouritesTable)
      .where(
        and(
          eq(favouritesTable.userId, userId),
          eq(favouritesTable.recipeId, recipeId),
        ),
      )
      .execute();
    if (existingFavourite.length === 0) {
      throw new AppError(
        "Authenticated user has not favourited this recipe.",
        404,
      );
    }
    await databaseClient.db
      .delete(favouritesTable)
      .where(
        and(
          eq(favouritesTable.userId, userId),
          eq(favouritesTable.recipeId, recipeId),
        ),
      )
      .execute();
  }

  async getUserFavourites(userId: number) {
    return await databaseClient.db
      .select({
        recipeId: recipesTable.recipeId,
        recipeTitle: recipesTable.title,
        favouritedAt: favouritesTable.favouritedAt,
      })
      .from(favouritesTable)
      .innerJoin(
        recipesTable,
        eq(favouritesTable.recipeId, recipesTable.recipeId),
      )
      .where(
        and(
          eq(favouritesTable.userId, userId),
          eq(recipesTable.visibility, "public"),
        ),
      )
      .orderBy(desc(favouritesTable.favouritedAt))
      .execute();
  }

  async getRecipeFavourites(userId: number, recipeId: number) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.creatorId !== userId) {
      throw new AppError(
        "Only recipe creator can view recipe's list of favourites.",
        403,
      );
    }
    return await databaseClient.db
      .select({
        userId: favouritesTable.userId,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        favouritedAt: favouritesTable.favouritedAt,
      })
      .from(favouritesTable)
      .innerJoin(usersTable, eq(favouritesTable.userId, usersTable.userId))
      .where(eq(favouritesTable.recipeId, recipeId))
      .orderBy(desc(favouritesTable.favouritedAt))
      .execute();
  }
}

export const favouritesService = new FavouritesService();
