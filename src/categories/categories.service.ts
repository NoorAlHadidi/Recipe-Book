import { databaseClient, categoriesTable } from "@/database";
import { AppError } from "@/errors";
import { AddCategoryDTO, EditCategoryDTO } from "@/categories";
import { eq, ne, and, or } from "drizzle-orm";

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
      .where(eq(categoriesTable.categoryId, categoryId));
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
      .where(eq(categoriesTable.categoryId, categoryId));
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
      .where(eq(categoriesTable.categoryId, categoryId));
    if (existingCategory.length === 0) {
      throw new AppError("No category with this ID exists.", 404);
    }
    return existingCategory[0];
  }
}

export const categoriesService = new CategoriesService();
