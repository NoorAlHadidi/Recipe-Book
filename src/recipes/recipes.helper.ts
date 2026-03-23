import { databaseClient, tagsTable, recipesTagsTable } from "@/database";
import { eq, and } from "drizzle-orm";

export const checkRecipeTags = async (recipeId: number, tagNames: string[]) => {
  for (const tagName of tagNames) {
    const existingTag = await databaseClient.db
      .select({ tagId: tagsTable.tagId })
      .from(tagsTable)
      .where(eq(tagsTable.name, tagName))
      .execute();

    const tagId =
      existingTag.length > 0
        ? existingTag[0].tagId
        : (
            await databaseClient.db
              .insert(tagsTable)
              .values({ name: tagName })
              .returning({ tagId: tagsTable.tagId })
              .execute()
          )[0].tagId;
    const existingRecipeTag = await databaseClient.db
      .select()
      .from(recipesTagsTable)
      .where(
        and(
          eq(recipesTagsTable.recipeId, recipeId),
          eq(recipesTagsTable.tagId, tagId),
        ),
      )
      .execute();
    if (existingRecipeTag.length === 0) {
      await databaseClient.db
        .insert(recipesTagsTable)
        .values({
          recipeId,
          tagId,
        })
        .execute();
    }
  }
};