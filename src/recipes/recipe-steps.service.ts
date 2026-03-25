import { databaseClient, recipesTable, stepsTable } from "@/database";
import { AppError } from "@/errors";
import { checkRecipeExists, AddRecipeStepsDTO } from "@/recipes";
import { eq, max } from "drizzle-orm";

class RecipeStepsService {
  async addSteps(
    userId: number,
    recipeId: number,
    stepsDTO: AddRecipeStepsDTO,
  ) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.creatorId !== userId) {
      throw new AppError(
        "Requesting user is not authorised to edit this recipe.",
        403,
      );
    }
    const { steps } = stepsDTO;
    const lastStep = await databaseClient.db
      .select({ value: max(stepsTable.stepNumber) })
      .from(stepsTable)
      .where(eq(stepsTable.recipeId, recipeId))
      .execute();
    let nextStep = lastStep[0].value ? lastStep[0].value + 1 : 1;
    for (const instruction of steps) {
      await databaseClient.db
        .insert(stepsTable)
        .values({
          stepNumber: nextStep,
          recipeId,
          instruction,
        })
        .execute();
      nextStep++;
    }
    await databaseClient.db
      .update(recipesTable)
      .set({ updatedAt: new Date() })
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
    const recipeSteps = await databaseClient.db
      .select({
        stepNumber: stepsTable.stepNumber,
        stepInstruction: stepsTable.instruction,
      })
      .from(stepsTable)
      .where(eq(stepsTable.recipeId, recipeId))
      .execute();
    return recipeSteps;
  }
}

export const recipeStepsService = new RecipeStepsService();
