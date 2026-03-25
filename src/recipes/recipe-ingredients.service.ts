import { databaseClient, recipesIngredientsTable, recipesTable } from "@/database";
import { AppError } from "@/errors";
import {
  checkRecipeExists,
  addRecipeIngredients,
  AddRecipeIngredientsDTO,
} from "@/recipes";
import { eq } from "drizzle-orm";

class RecipeIngredientsService {
  async addIngredients(
    userId: number,
    recipeId: number,
    ingredientsDTO: AddRecipeIngredientsDTO,
  ) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.creatorId !== userId) {
      throw new AppError(
        "Requesting user is not authorised to edit this recipe.",
        403,
      );
    }
    const { ingredients } = ingredientsDTO;
    await addRecipeIngredients(recipeId, ingredients);
    await databaseClient.db
      .update(recipesTable)
      .set({ updatedAt: new Date() })
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
    return await databaseClient.db
      .select({
        ingredientId: recipesIngredientsTable.ingredientId,
        quantity: recipesIngredientsTable.quantity,
        unitId: recipesIngredientsTable.unitId,
        notes: recipesIngredientsTable.notes,
      })
      .from(recipesIngredientsTable)
      .where(eq(recipesIngredientsTable.recipeId, recipeId))
      .execute();
  }
}

export const recipeIngredientsService = new RecipeIngredientsService();
