import { databaseClient, recipesTable, categoriesTable } from "@/database";
import { AddRecipeDTO } from "@/recipes";
import { AppError } from "@/errors";
import { eq } from "drizzle-orm";

class RecipesService {
  async addRecipe(userId: number, addRecipeDTO: AddRecipeDTO) {
    const { title, description, visibility, categoryId } = addRecipeDTO;
    const existingCategory = await databaseClient.db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.categoryId, categoryId))
      .execute();
    if (existingCategory.length === 0) {
      throw new AppError("No category with the specified ID exists.", 404);
    }
    const newRecipe = await databaseClient.db
      .insert(recipesTable)
      .values({
        title: title,
        description: description,
        visibility: visibility,
        creatorId: userId,
        categoryId: categoryId,
      })
      .returning({
        recipeId: recipesTable.recipeId,
        title: recipesTable.title,
        description: recipesTable.description,
        visibility: recipesTable.visibility,
        categoryId: recipesTable.categoryId,
        creatorId: recipesTable.creatorId,
        createdAt: recipesTable.createdAt,
      })
      .execute();
    return newRecipe[0];
  }

  async deleteRecipe(userId: number, recipeId: number) {
    const existingRecipe = await databaseClient.db
      .select({ creatorId: recipesTable.creatorId })
      .from(recipesTable)
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
    if (existingRecipe.length === 0) {
      throw new AppError("No recipe with the specified ID exists.", 404);
    }
    const { creatorId } = existingRecipe[0];
    if (creatorId !== userId) {
      throw new AppError(
        "Requesting user is not authorised to delete this recipe.",
        403,
      );
    }
    await databaseClient.db
      .delete(recipesTable)
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
  }
}

export const recipesService = new RecipesService();
