import {
  databaseClient,
  recipesTable,
  categoriesTable,
  recipesTagsTable,
} from "@/database";
import {
  AddRecipeDTO,
  EditRecipeDTO,
  RecipeQueryParamDTO,
  checkRecipeIngredients,
  checkRecipeTags,
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
      if (tagNames !== undefined) {
        await checkRecipeTags(newRecipe[0].recipeId, tagNames, tx);
      }
      if (ingredients !== undefined) {
        await checkRecipeIngredients(newRecipe[0].recipeId, ingredients, tx);
      }
      return newRecipe[0];
    });
  }

  async deleteRecipe(userId: number, recipeId: number) {
    const existingRecipe = await databaseClient.db
      .select({ creatorId: recipesTable.creatorId })
      .from(recipesTable)
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
    if (existingRecipe.length === 0) {
      throw new AppError("No recipe with the specified ID exists.", 404);
    }
    if (existingRecipe[0].creatorId !== userId) {
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
      const existingRecipe = await tx
        .select({ creatorId: recipesTable.creatorId })
        .from(recipesTable)
        .where(eq(recipesTable.recipeId, recipeId))
        .execute();
      if (existingRecipe.length === 0) {
        throw new AppError("No recipe with the specified ID exists.", 404);
      }
      if (existingRecipe[0].creatorId !== userId) {
        throw new AppError(
          "Requesting user is not authorised to delete this recipe.",
          403,
        );
      }
      const {
        title,
        description,
        visibility,
        categoryId,
        tagNames,
        ingredients,
      } = editRecipeDTO;
      const updateValues: any = {};
      if (categoryId !== undefined) {
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
      if (title !== undefined) {
        updateValues.title = title;
      }
      if (description !== undefined) {
        updateValues.description = description;
      }
      if (visibility !== undefined) {
        updateValues.visibility = visibility;
      }
      if (tagNames !== undefined) {
        await checkRecipeTags(recipeId, tagNames, tx);
      }
      if (ingredients !== undefined) {
        await checkRecipeIngredients(recipeId, ingredients, tx);
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
    const existingRecipe = await databaseClient.db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.recipeId, recipeId))
      .execute();
    if (existingRecipe.length === 0) {
      throw new AppError("No recipe with the specified ID exists.", 404);
    }
    if (
      existingRecipe[0].creatorId !== userId &&
      existingRecipe[0].visibility === "private"
    ) {
      throw new AppError(
        "Requesting user is not authorised to view this recipe.",
        403,
      );
    }
    return existingRecipe[0];
  }

  async getRecipes(userId: number, recipeQueryParams: RecipeQueryParamDTO) {
    const { page, limit, title, creatorId, categoryId, tagId } =
      recipeQueryParams;
    const offset = (page - 1) * limit;
    let recipesQuery;
    const filterConditions = [];
    filterConditions.push(
      or(
        eq(recipesTable.visibility, "public"),
        eq(recipesTable.creatorId, userId),
      ),
    );

    if (title !== undefined) {
      filterConditions.push(ilike(recipesTable.title, `%${title}%`));
    }
    if (creatorId !== undefined) {
      filterConditions.push(eq(recipesTable.creatorId, creatorId));
    }
    if (categoryId !== undefined) {
      filterConditions.push(eq(recipesTable.categoryId, categoryId));
    }
    if (tagId !== undefined) {
      filterConditions.push(eq(recipesTagsTable.tagId, tagId));
      recipesQuery = await databaseClient.db
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
        .from(recipesTable)
        .innerJoin(
          recipesTagsTable,
          eq(recipesTagsTable.recipeId, recipesTable.recipeId),
        )
        .where(and(...filterConditions))
        .limit(limit)
        .offset(offset)
        .execute();
    } else {
      recipesQuery = await databaseClient.db
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
        .from(recipesTable)
        .where(and(...filterConditions))
        .limit(limit)
        .offset(offset)
        .execute();
    }
    return {
      page,
      limit,
      total: recipesQuery.length > 0 ? recipesQuery[0].total : 0,
      recipes: recipesQuery.map(({ total, ...recipe }) => recipe)
    };
  }
}

export const recipesService = new RecipesService();
