import { databaseClient, ratingsTable, usersTable } from "@/database";
import { eq, and, desc, sql } from "drizzle-orm";
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

  async deleteRating(userId: number, recipeId: number) {
    await checkRecipeExists(recipeId);
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
    if (existingRating.length === 0) {
      throw new AppError(
        "Authenticated user has no rating for this recipe.",
        404,
      );
    }
    await databaseClient.db
      .delete(ratingsTable)
      .where(
        and(
          eq(ratingsTable.userId, userId),
          eq(ratingsTable.recipeId, recipeId),
        ),
      )
      .execute();
  }

  async getRatings(recipeId: number) {
    await checkRecipeExists(recipeId);
    const ratings = await databaseClient.db
      .select({
        userId: usersTable.userId,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        rating: ratingsTable.rating,
        ratedAt: ratingsTable.ratedAt,
        total: sql`count(*) over()`.mapWith(Number),
        average: sql`avg(${ratingsTable.rating}) over()`.mapWith(Number),
      })
      .from(ratingsTable)
      .innerJoin(usersTable, eq(ratingsTable.userId, usersTable.userId))
      .where(eq(ratingsTable.recipeId, recipeId))
      .orderBy(desc(ratingsTable.ratedAt), desc(ratingsTable.rating))
      .execute();
    return {
      total: ratings.length > 0 ? ratings[0].total : 0,
      average: ratings.length > 0 ? ratings[0].average : 0,
      data: ratings.map(({ total, average, ...rating }) => rating),
    };
  }
}

export const ratingsService = new RatingsService();
