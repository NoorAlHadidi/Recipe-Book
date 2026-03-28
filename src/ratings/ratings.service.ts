import {
  databaseClient,
  ratingsTable,
} from "@/database";
import { eq, and } from "drizzle-orm";
import { AddRatingDTO } from "@/ratings";
import { checkRecipeExists } from "@/recipes";
import { AppError } from "@/errors";

class RatingsService {
  async addRating(
    userId: number,
    recipeId: number,
    addRatingDTO: AddRatingDTO,
  ) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.visibility === "private") {
        throw new AppError("Private recipes cannot be rated.", 403);
    }
    const { rating } = addRatingDTO;
    const existingRating = await databaseClient.db
      .select()
      .from(ratingsTable)
      .where(
        and(
          eq(ratingsTable.userId, userId),
          eq(ratingsTable.recipeId, recipeId),
        ),
      )
      .execute();
    let newRating;
    if (existingRating.length === 0) {
      newRating = await databaseClient.db
        .insert(ratingsTable)
        .values({ userId, recipeId, rating })
        .returning()
        .execute();
    } else {
      newRating = await databaseClient.db
        .update(ratingsTable)
        .set({ rating })
        .where(
          and(
            eq(ratingsTable.userId, userId),
            eq(ratingsTable.recipeId, recipeId),
          ),
        )
        .returning()
        .execute();
    }
    return newRating[0];
  }
}

export const ratingsService = new RatingsService();
