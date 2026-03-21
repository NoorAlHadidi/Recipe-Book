import {
  databaseClient,
  ingredientsTable,
  unitsTable,
  ingredientsUnitsTable,
} from "@/database";
import { AppError } from "@/errors";
import {
  AddIngredientDTO,
  EditIngredientDTO,
  AddIngredientUnitDTO,
} from "@/ingredients";
import { eq, ne, and } from "drizzle-orm";

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

  async addIngredientUnit(
    ingredientId: number,
    addIngredientUnitDTO: AddIngredientUnitDTO,
  ) {
    const { unitId } = addIngredientUnitDTO;
    const existingIngredient = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
    if (existingIngredient.length === 0) {
      throw new AppError("No ingredient with this ID exists.", 404);
    }
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
    if (existingIngredientUnit.length > 0) {
      throw new AppError(
        "This unit is already valid for the specified ingredient.",
        409,
      );
    }
    const newIngredientUnit = await databaseClient.db
      .insert(ingredientsUnitsTable)
      .values({
        ingredientId: ingredientId,
        unitId: unitId,
      })
      .returning({
        ingredientId: ingredientsUnitsTable.ingredientId,
        unitId: ingredientsUnitsTable.unitId,
      })
      .execute();
    return newIngredientUnit[0];
  }

  async getIngredientUnits(ingredientId: number) {
    const existingIngredient = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
    if (existingIngredient.length === 0) {
      throw new AppError("No ingredient with this ID exists.", 404);
    }
    const ingredientUnits = await databaseClient.db
      .select({
        unitId: unitsTable.unitId,
        unitName: unitsTable.name,
      })
      .from(ingredientsUnitsTable)
      .innerJoin(
        unitsTable,
        eq(ingredientsUnitsTable.unitId, unitsTable.unitId),
      )
      .where(eq(ingredientsUnitsTable.ingredientId, ingredientId))
      .execute();
    return ingredientUnits;
  }

  async deleteIngredientUnit(ingredientId: number, unitId: number) {
    const existingIngredient = await databaseClient.db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredientId, ingredientId))
      .execute();
    if (existingIngredient.length === 0) {
      throw new AppError("No ingredient with this ID exists.", 404);
    }
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
        "This unit is not valid for the specified ingredient.",
        404,
      );
    }
    await databaseClient.db
      .delete(ingredientsUnitsTable)
      .where(
        and(
          eq(ingredientsUnitsTable.ingredientId, ingredientId),
          eq(ingredientsUnitsTable.unitId, unitId),
        ),
      )
      .execute();
  }
}

export const ingredientsService = new IngredientsService();
