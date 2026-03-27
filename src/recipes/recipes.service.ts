import {
  databaseClient,
  recipesTable,
  categoriesTable,
  recipesTagsTable,
  stepsTable,
  recipesIngredientsTable,
} from "@/database";
import {
  AddRecipeDTO,
  EditRecipeDTO,
  RecipeQueryParamDTO,
  checkRecipeExists,
  addRecipeIngredients,
  checkRecipeTags
} from "@/recipes";
import { AppError } from "@/errors";
import { eq, or, and, ilike, sql } from "drizzle-orm";

class RecipesService {
  async addRecipe(userId: number, addRecipeDTO: AddRecipeDTO) {
    const {
      title,
      description,
      visibility,
      categoryId,
      tagNames,
      ingredients,
      steps,
    } = addRecipeDTO;
    await databaseClient.db.transaction(async (tx) => {
      const existingCategory = await tx
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.categoryId, categoryId))
        .execute();
      if (existingCategory.length === 0) {
        throw new AppError("No category with the specified ID exists.", 404);
      }
      const newRecipe = await tx
        .insert(recipesTable)
        .values({
          title: title,
          description: description,
          visibility: visibility,
          creatorId: userId,
          categoryId: categoryId,
        })
        .returning({
          recipeId: recipesTable.recipeId,
          title: recipesTable.title,
          description: recipesTable.description,
          visibility: recipesTable.visibility,
          categoryId: recipesTable.categoryId,
          creatorId: recipesTable.creatorId,
          createdAt: recipesTable.createdAt,
        })
        .execute();
      const newRecipeId = newRecipe[0].recipeId;
      if (tagNames) {
        await checkRecipeTags(newRecipeId, tagNames, tx);
      }
      if (ingredients) {
        await addRecipeIngredients(newRecipeId, ingredients, tx);
      }
      if (steps) {
        for (let i = 0; i < steps.length; i++) {
          await tx
            .insert(stepsTable)
            .values({
              stepNumber: i + 1,
              recipeId: newRecipeId,
              instruction: steps[i],
            })
            .execute();
        }
      }
      return newRecipe[0];
    });
  }

  async deleteRecipe(userId: number, recipeId: number) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.creatorId !== userId) {
      throw new AppError(
        "Requesting user is not authorised to delete this recipe.",
        403,
      );
    }
    await databaseClient.db
      .delete(recipesTable)
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
  }

  async editRecipe(
    userId: number,
    recipeId: number,
    editRecipeDTO: EditRecipeDTO,
  ) {
    await databaseClient.db.transaction(async (tx) => {
      const existingRecipe = await checkRecipeExists(recipeId, tx);
      if (existingRecipe.creatorId !== userId) {
        throw new AppError(
          "Requesting user is not authorised to delete this recipe.",
          403,
        );
      }
      const { title, description, visibility, categoryId, tagNames } =
        editRecipeDTO;
      const updateValues: any = {};
      if (categoryId) {
        updateValues.categoryId = categoryId;
        const existingCategory = await tx
          .select()
          .from(categoriesTable)
          .where(eq(categoriesTable.categoryId, categoryId))
          .execute();

        if (existingCategory.length === 0) {
          throw new AppError("No category with the specified ID exists.", 404);
        }
      }
      if (title) {
        updateValues.title = title;
      }
      if (description) {
        updateValues.description = description;
      }
      if (visibility) {
        updateValues.visibility = visibility;
      }
      if (tagNames) {
        await checkRecipeTags(recipeId, tagNames, tx);
      }

      updateValues.updatedAt = new Date();

      const updatedRecipe = await tx
        .update(recipesTable)
        .set(updateValues)
        .where(eq(recipesTable.recipeId, recipeId))
        .returning()
        .execute();

      return updatedRecipe[0];
    });
  }

  async getRecipe(userId: number, recipeId: number) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (
      existingRecipe.creatorId !== userId &&
      existingRecipe.visibility === "private"
    ) {
      throw new AppError(
        "Requesting user is not authorised to view this recipe.",
        403,
      );
    }
    return existingRecipe;
  }

  async getRecipes(userId: number, recipeQueryParams: RecipeQueryParamDTO) {
    const { page, limit, title, creatorId, categoryId, ingredientId, tagId } =
      recipeQueryParams;

    const offset = (page - 1) * limit;

    const filterConditions = [];
    filterConditions.push(
      or(
        eq(recipesTable.visibility, "public"),
        eq(recipesTable.creatorId, userId),
      ),
    );

    if (title) {
      filterConditions.push(ilike(recipesTable.title, `%${title}%`));
    }
    if (creatorId) {
      filterConditions.push(eq(recipesTable.creatorId, creatorId));
    }
    if (categoryId) {
      filterConditions.push(eq(recipesTable.categoryId, categoryId));
    }

    const recipesQuery = databaseClient.db
      .select({
        recipeId: recipesTable.recipeId,
        title: recipesTable.title,
        description: recipesTable.description,
        visibility: recipesTable.visibility,
        creatorId: recipesTable.creatorId,
        categoryId: recipesTable.categoryId,
        createdAt: recipesTable.createdAt,
        updatedAt: recipesTable.updatedAt,
        total: sql`count(*) over()`.mapWith(Number),
      })
      .from(recipesTable);

    if (ingredientId) {
      filterConditions.push(
        eq(recipesIngredientsTable.ingredientId, ingredientId),
      );
      recipesQuery.innerJoin(
        recipesIngredientsTable,
        eq(recipesIngredientsTable.recipeId, recipesTable.recipeId),
      );
    }

    if (tagId) {
      filterConditions.push(eq(recipesTagsTable.tagId, tagId));
      recipesQuery.innerJoin(
        recipesTagsTable,
        eq(recipesTagsTable.recipeId, recipesTable.recipeId),
      );
    }

    recipesQuery
      .where(and(...filterConditions))
      .limit(limit)
      .offset(offset);

    const recipes = await recipesQuery.execute();

    return {
      page,
      limit,
      total: recipes.length > 0 ? recipes[0].total : 0,
      data: recipes.map(({ total, ...recipe }) => recipe),
    };
  }
}

export const recipesService = new RecipesService();
