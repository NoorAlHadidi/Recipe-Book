import { databaseClient, categoriesTable } from "@/database";
import { AppError } from "@/errors";
import { AddCategoryDTO, EditCategoryDTO } from "@/categories";
import { eq } from "drizzle-orm";

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
    if (name !== undefined) {
      updateValues.name = name;
    }
    if (description !== undefined) {
      updateValues.description = description;
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
}

export const categoriesService = new CategoriesService();
