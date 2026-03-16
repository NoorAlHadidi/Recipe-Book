import { databaseClient, ingredientsTable } from "@/database";
import { AppError } from "@/errors";
import { AddIngredientDTO } from "@/ingredients";
import { eq } from "drizzle-orm";

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
}

export const ingredientsService = new IngredientsService();
