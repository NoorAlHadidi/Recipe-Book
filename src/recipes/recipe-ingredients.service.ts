import {
  databaseClient,
  ingredientsTable,
  ingredientsUnitsTable,
  recipesIngredientsTable,
  recipesTable,
  unitsTable,
} from "@/database";
import { AppError } from "@/errors";
import {
  checkRecipeExists,
  addRecipeIngredients,
  AddRecipeIngsDTO,
  EditRecipeIngDTO,
  logRecipeChange,
} from "@/recipes";
import { checkIngredientExists } from "@/ingredients";
import { eq, and } from "drizzle-orm";

class RecipeIngredientsService {
  async addIngredients(
    userId: number,
    recipeId: number,
    ingredientsDTO: AddRecipeIngsDTO,
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

  async editIngredient(
    userId: number,
    recipeId: number,
    ingredientId: number,
    ingerdientDTO: EditRecipeIngDTO,
  ) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.creatorId !== userId) {
      throw new AppError(
        "Requesting user is not authorised to edit this recipe.",
        403,
      );
    }

    await checkIngredientExists(ingredientId);

    const existingRecipeIng = await databaseClient.db
      .select()
      .from(recipesIngredientsTable)
      .where(
        and(
          eq(recipesIngredientsTable.recipeId, recipeId),
          eq(recipesIngredientsTable.ingredientId, ingredientId),
        ),
      )
      .execute();
    if (existingRecipeIng.length === 0) {
      throw new AppError(
        "Ingredient is not included in the specified recipe.",
        404,
      );
    }
    const updateValues: any = {};
    const { unitId, quantity, notes } = ingerdientDTO;
    if (unitId) {
      const existingUnit = await databaseClient.db
        .select()
        .from(unitsTable)
        .where(eq(unitsTable.unitId, unitId))
        .execute();
      if (existingUnit.length === 0) {
        throw new AppError("No unit with this ID exists.", 404);
      }
      const existingIngredientUnit = await databaseClient.db
        .select()
        .from(ingredientsUnitsTable)
        .where(
          and(
            eq(ingredientsUnitsTable.ingredientId, ingredientId),
            eq(ingredientsUnitsTable.unitId, unitId),
          ),
        )
        .execute();
      if (existingIngredientUnit.length === 0) {
        throw new AppError(
          `Unit with ID ${unitId} is not valid for ingredient with ID ${ingredientId}.`,
          400,
        );
      }
      updateValues.unitId = unitId;
    }
    if (quantity) {
      updateValues.quantity = quantity;
    }
    if (notes) {
      updateValues.notes = notes;
    }
    updateValues.updatedAt = new Date();
    await databaseClient.db
      .update(recipesIngredientsTable)
      .set(updateValues)
      .where(
        and(
          eq(recipesIngredientsTable.recipeId, recipeId),
          eq(recipesIngredientsTable.ingredientId, ingredientId),
        ),
      )
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

  async deleteIngredient(
    userId: number,
    recipeId: number,
    ingredientId: number,
  ) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.creatorId !== userId) {
      throw new AppError(
        "Requesting user is not authorised to edit this recipe.",
        403,
      );
    }

    await checkIngredientExists(ingredientId);

    const existingRecipeIng = await databaseClient.db
      .select()
      .from(recipesIngredientsTable)
      .where(
        and(
          eq(recipesIngredientsTable.recipeId, recipeId),
          eq(recipesIngredientsTable.ingredientId, ingredientId),
        ),
      )
      .execute();
    if (existingRecipeIng.length === 0) {
      throw new AppError(
        "Ingredient is not included in the specified recipe.",
        404,
      );
    }
    await databaseClient.db
      .delete(recipesIngredientsTable)
      .where(
        and(
          eq(recipesIngredientsTable.recipeId, recipeId),
          eq(recipesIngredientsTable.ingredientId, ingredientId),
        ),
      )
      .execute();
    await databaseClient.db
      .update(recipesTable)
      .set({ updatedAt: new Date() })
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
    await logRecipeChange(
      recipeId,
      "delete",
      "ingredient",
      ingredientId,
      String(ingredientId),
      null,
    );
  }

  async getIngredients(userId: number, recipeId: number) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (
      existingRecipe.creatorId !== userId &&
      existingRecipe.visibility === "private"
    ) {
      throw new AppError(
        "Requesting user is not authorised to view this recipe's details.",
        403,
      );
    }
    return databaseClient.db
      .select({
        ingredientId: ingredientsTable.ingredientId,
        ingredientName: ingredientsTable.name,
        quantity: recipesIngredientsTable.quantity,
        unitId: unitsTable.unitId,
        unitName: unitsTable.name,
        notes: recipesIngredientsTable.notes,
      })
      .from(recipesIngredientsTable)
      .innerJoin(
        ingredientsTable,
        eq(recipesIngredientsTable.ingredientId, ingredientsTable.ingredientId),
      )
      .innerJoin(
        unitsTable,
        eq(recipesIngredientsTable.unitId, unitsTable.unitId),
      )
      .where(eq(recipesIngredientsTable.recipeId, recipeId))
      .execute();
  }
}

export const recipeIngredientsService = new RecipeIngredientsService();
