import { databaseClient, ingredientsTable } from "@/database";
import { AppError } from "@/errors";
import { eq } from "drizzle-orm";

export async function checkIngredientExists(ingredientId: number) {
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
