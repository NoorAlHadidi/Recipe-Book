import { databaseClient, categoriesTable } from "@/database";
import { AppError } from "@/errors";
import {
  AddCategoryDTO,
  CategoryQueryParamDTO,
  EditCategoryDTO,
} from "@/categories";
import { eq, ne, and, or, ilike, sql } from "drizzle-orm";

class CategoriesService {
  async addCategory(addCategoryDTO: AddCategoryDTO) {
    const { name, description } = addCategoryDTO;
    const existingCategory = await databaseClient.db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.name, name))
      .execute();
    if (existingCategory.length > 0) {
      throw new AppError("A category with this name already exists.", 409);
    }
    const newCategory = await databaseClient.db
      .insert(categoriesTable)
      .values({
        name: name,
        description: description,
      })
      .returning({
        categoryId: categoriesTable.categoryId,
        name: categoriesTable.name,
        description: categoriesTable.description,
      })
      .execute();
    return newCategory[0];
  }

  async editCategory(categoryId: number, editCategoryDTO: EditCategoryDTO) {
    const existingCategory = await databaseClient.db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.categoryId, categoryId))
      .execute();
    if (existingCategory.length === 0) {
      throw new AppError("No category with this ID exists.", 404);
    }
    const { name, description } = editCategoryDTO;
    const updateValues: any = {};
    const conflictConditions = [];
    if (name !== undefined) {
      updateValues.name = name;
      conflictConditions.push(eq(categoriesTable.name, name));
    }
    if (description !== undefined) {
      updateValues.description = description;
      conflictConditions.push(eq(categoriesTable.description, description));
    }
    if (conflictConditions.length > 0) {
      const conflictCategory = await databaseClient.db
        .select()
        .from(categoriesTable)
        .where(
          and(
            ne(categoriesTable.categoryId, categoryId),
            or(...conflictConditions),
          ),
        )
        .execute();
      if (conflictCategory.length > 0) {
        throw new AppError(
          "Another category with this name or description already exists.",
          409,
        );
      }
    }
    const updatedCategory = await databaseClient.db
      .update(categoriesTable)
      .set(updateValues)
      .where(eq(categoriesTable.categoryId, categoryId))
      .returning({
        categoryId: categoriesTable.categoryId,
        name: categoriesTable.name,
        description: categoriesTable.description,
      })
      .execute();

    return updatedCategory[0];
  }

  async deleteCategory(categoryId: number) {
    const existingCategory = await databaseClient.db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.categoryId, categoryId))
      .execute();
    if (existingCategory.length === 0) {
      throw new AppError("No category with this ID exists.", 404);
    }
    await databaseClient.db
      .delete(categoriesTable)
      .where(eq(categoriesTable.categoryId, categoryId))
      .execute();
  }

  async getCategory(categoryId: number) {
    const existingCategory = await databaseClient.db
      .select({
        categoryId: categoriesTable.categoryId,
        name: categoriesTable.name,
        description: categoriesTable.description,
      })
      .from(categoriesTable)
      .where(eq(categoriesTable.categoryId, categoryId))
      .execute();
    if (existingCategory.length === 0) {
      throw new AppError("No category with this ID exists.", 404);
    }
    return existingCategory[0];
  }

  async getCategories(categoryQueryParams: CategoryQueryParamDTO) {
    const { page, limit, name } = categoryQueryParams;
    const filterConditions = [];
    if (name) {
      filterConditions.push(ilike(categoriesTable.name, `%${name}%`));
    }
    const categoriesQuery = databaseClient.db
      .select({
        categoryId: categoriesTable.categoryId,
        name: categoriesTable.name,
        description: categoriesTable.description,
        total: sql`count(*) over()`.mapWith(Number),
      })
      .from(categoriesTable)
      .orderBy(categoriesTable.createdAt);

    if (filterConditions.length > 0) {
      categoriesQuery.where(and(...filterConditions));
    }

    if (page && limit) {
      const offset = (page - 1) * limit;
      categoriesQuery.limit(limit).offset(offset);
    }

    const categories = await categoriesQuery.execute();

    const total = categories.length > 0 ? categories[0].total : 0;

    return {
      page: page ? page : 1,
      limit: limit ? limit : total,
      total,
      data: categories.map(({ total, ...category }) => category),
    };
  }
}

export const categoriesService = new CategoriesService();
