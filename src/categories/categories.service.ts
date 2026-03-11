import {
  databaseClient,
  categoriesTable,
} from "@/database";
import { AppError } from "@/errors";
import { AddCategoryDTO } from "@/categories";
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
}

export const categoriesService = new CategoriesService();
