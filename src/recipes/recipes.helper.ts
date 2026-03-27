import {
  databaseClient,
  recipesTable,
  tagsTable,
  recipesTagsTable,
  ingredientsTable,
  unitsTable,
  ingredientsUnitsTable,
  recipesIngredientsTable,
  recipeChangeLogsTable,
  recipeActionEnum,
  recipeFieldEnum,
} from "@/database";
import { AppError } from "@/errors";
import { eq, and } from "drizzle-orm";

export async function checkRecipeExists(
  recipeId: number,
  db: any = databaseClient.db,
) {
  const existingRecipe = await databaseClient.db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.recipeId, recipeId))
    .execute();
  if (existingRecipe.length === 0) {
    throw new AppError("No recipe with the specified ID exists.", 404);
  }
  return existingRecipe[0];
}

export const checkRecipeTags = async (
  recipeId: number,
  tagNames: string[],
  db: any = databaseClient.db,
) => {
  for (const tagName of tagNames) {
    const existingTag = await db
      .select({ tagId: tagsTable.tagId })
      .from(tagsTable)
      .where(eq(tagsTable.name, tagName))
      .execute();

    const tagId =
      existingTag.length > 0
        ? existingTag[0].tagId
        : (
            await db
              .insert(tagsTable)
              .values({ name: tagName })
              .returning({ tagId: tagsTable.tagId })
              .execute()
          )[0].tagId;
    const existingRecipeTag = await db
      .select()
      .from(recipesTagsTable)
      .where(
        and(
          eq(recipesTagsTable.recipeId, recipeId),
          eq(recipesTagsTable.tagId, tagId),
        ),
      )
      .execute();
    if (existingRecipeTag.length === 0) {
      await db
        .insert(recipesTagsTable)
        .values({
          recipeId,
          tagId,
        })
        .execute();
    }
  }
};

export const addRecipeIngredients = async (
  recipeId: number,
  ingredients: {
    ingredientId: number;
    quantity: number;
    unitId: number;
    notes?: string;
  }[],
  db: any = databaseClient.db,
) => {
  for (const ingredient of ingredients) {
    const { ingredientId, quantity, unitId, notes } = ingredient;
    const existingIngredient = await db
      .select({ ingredientId: ingredientsTable.ingredientId })
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
    if (existingIngredient.length === 0) {
      throw new AppError(
        `Ingredient with ID ${ingredientId} does not exist.`,
        404,
      );
    }

    const existingUnit = await db
      .select({ unitId: unitsTable.unitId })
      .from(unitsTable)
      .where(eq(unitsTable.unitId, unitId))
      .execute();
    if (existingUnit.length === 0) {
      throw new AppError(`Unit with ID ${unitId} does not exist.`, 404);
    }

    const existingRecipeIngredient = await db
      .select()
      .from(recipesIngredientsTable)
      .where(
        and(
          eq(recipesIngredientsTable.recipeId, recipeId),
          eq(recipesIngredientsTable.ingredientId, ingredientId),
        ),
      )
      .execute();
    if (existingRecipeIngredient.length > 0) {
      throw new AppError(
        `Ingredient with ID ${ingredientId} already exists in this recipe.`,
        409,
      );
    }

    const existingIngredientUnit = await db
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
    await db
      .insert(recipesIngredientsTable)
      .values({
        recipeId,
        ingredientId,
        unitId,
        quantity,
        notes,
      })
      .execute();
  }
};
