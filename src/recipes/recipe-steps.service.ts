import { databaseClient, recipesTable, stepsTable } from "@/database";
import { AppError } from "@/errors";
import { checkRecipeExists, AddRecipeStepsDTO, EditRecipeStepDTO } from "@/recipes";
import { eq, max, and } from "drizzle-orm";

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
      .orderBy(stepsTable.stepNumber)
      .execute();
    return recipeSteps;
  }

  async editStep(userId: number, recipeId: number, stepNumber: number, stepDTO: EditRecipeStepDTO) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.creatorId !== userId) {
      throw new AppError(
        "Requesting user is not authorised to edit this recipe.",
        403,
      );
    }
    const existingStep = await databaseClient.db
      .select()
      .from(stepsTable)
      .where(
        and(
          eq(stepsTable.recipeId, recipeId),
          eq(stepsTable.stepNumber, stepNumber),
        ),
      )
      .execute();
    if (existingStep.length === 0) {
      throw new AppError("Step does not exist for this recipe.", 404);
    }
    const { instruction } = stepDTO;
    await databaseClient.db
      .update(stepsTable)
      .set({
        instruction,
      })
      .where(
        and(
          eq(stepsTable.recipeId, recipeId),
          eq(stepsTable.stepNumber, stepNumber),
        ),
      )
      .execute();
    await databaseClient.db
      .update(recipesTable)
      .set({ updatedAt: new Date() })
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
    const updatedRecipeSteps = await databaseClient.db
      .select({
        stepNumber: stepsTable.stepNumber,
        stepInstruction: stepsTable.instruction,
      })
      .from(stepsTable)
      .where(eq(stepsTable.recipeId, recipeId))
      .orderBy(stepsTable.stepNumber)
      .execute();
    return updatedRecipeSteps;
  }
}

export const recipeStepsService = new RecipeStepsService();
