import {
  databaseClient,
  tagsTable,
  recipesTagsTable,
  ingredientsTable,
  unitsTable,
  ingredientsUnitsTable,
  recipesIngredientsTable,
} from "@/database";
import { AppError } from "@/errors";
import { eq, and } from "drizzle-orm";

export const checkRecipeTags = async (
  recipeId: number,
  tagNames: string[],
  tx: any,
) => {
  for (const tagName of tagNames) {
    const existingTag = await tx
      .select({ tagId: tagsTable.tagId })
      .from(tagsTable)
      .where(eq(tagsTable.name, tagName))
      .execute();

    const tagId =
      existingTag.length > 0
        ? existingTag[0].tagId
        : (
            await tx
              .insert(tagsTable)
              .values({ name: tagName })
              .returning({ tagId: tagsTable.tagId })
              .execute()
          )[0].tagId;
    const existingRecipeTag = await tx
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
      await tx
        .insert(recipesTagsTable)
        .values({
          recipeId,
          tagId,
        })
        .execute();
    }
  }
};

export const checkRecipeIngredients = async (
  recipeId: number,
  ingredients: {
    ingredientId: number;
    quantity: number;
    unitId: number;
    notes?: string;
  }[],
  tx: any,
) => {
  for (const ingredient of ingredients) {
    const { ingredientId, quantity, unitId, notes } = ingredient;
    const existingIngredient = await tx
      .select({ ingredientId: ingredientsTable.ingredientId })
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
    if (existingIngredient.length === 0) {
      throw new AppError("No ingredient with the specified ID exists.", 404);
    }

    const existingUnit = await tx
      .select({ unitId: unitsTable.unitId })
      .from(unitsTable)
      .where(eq(unitsTable.unitId, unitId))
      .execute();
    if (existingUnit.length === 0) {
      throw new AppError("No unit with the specified ID exists.", 404);
    }

    const existingIngredientUnit = await tx
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
        "This unit is not valid for the specified ingredient.",
        400,
      );
    }
    const existingRecipeIngredient = await tx
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
        "Ingredient has already been added to the recipe.",
        409,
      );
    }
    await tx
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
