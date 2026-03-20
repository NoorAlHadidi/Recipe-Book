import { databaseClient, ingredientsTable } from "@/database";
import { AppError } from "@/errors";
import { AddIngredientDTO, EditIngredientDTO } from "@/ingredients";
import { eq, ne, and, or } from "drizzle-orm";

class IngredientsService {
  async addIngredient(addIngredientDTO: AddIngredientDTO) {
    const { name } = addIngredientDTO;
    const existingIngredient = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.name, name))
      .execute();
    if (existingIngredient.length > 0) {
      throw new AppError("An ingredient with this name already exists.", 409);
    }
    const newIngredient = await databaseClient.db
      .insert(ingredientsTable)
      .values({
        name: name,
      })
      .returning({
        ingredientId: ingredientsTable.ingredientId,
        name: ingredientsTable.name,
      })
      .execute();
    return newIngredient[0];
  }

  async editIngredient(
    ingredientId: number,
    editIngredientDTO: EditIngredientDTO,
  ) {
    const existingIngredient = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
    if (existingIngredient.length === 0) {
      throw new AppError("No ingredient with this ID exists.", 404);
    }
    const { name } = editIngredientDTO;
    const conflictIngredient = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .where(
        and(
          ne(ingredientsTable.ingredientId, ingredientId),
          eq(ingredientsTable.name, name),
        ),
      )
      .execute();
    if (conflictIngredient.length > 0) {
      throw new AppError(
        "Another ingredient with this name already exists.",
        409,
      );
    }
    const updatedIngredient = await databaseClient.db
      .update(ingredientsTable)
      .set({ name: name })
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .returning({
        ingredientId: ingredientsTable.ingredientId,
        name: ingredientsTable.name,
      })
      .execute();
    return updatedIngredient[0];
  }

  async deleteIngredient(ingredientId: number) {
    const existingIngredient = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
    if (existingIngredient.length === 0) {
      throw new AppError("No ingredient with this ID exists.", 404);
    }
    await databaseClient.db
      .delete(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
  }

  async getIngredient(ingredientId: number) {
    const existingIngredient = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
    if (existingIngredient.length === 0) {
      throw new AppError("No ingredient with this ID exists.", 404);
    }
    return existingIngredient[0];
  }

  async getIngredients() {
    const ingredients = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .execute();
    return ingredients;
  }
}

export const ingredientsService = new IngredientsService();
