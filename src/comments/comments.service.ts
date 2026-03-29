import {
  databaseClient,
  usersTable,
  commentsTable,
  reportsTable,
} from "@/database";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { checkRecipeExists } from "@/recipes";
import { AppError } from "@/errors";
import { AddCommentDTO } from "@/comments";

class CommentsService {
  async addComment(
    userId: number,
    recipeId: number,
    addCommentDTO: AddCommentDTO,
  ) {
    const existingRecipe = await checkRecipeExists(recipeId);
    if (existingRecipe.visibility === "private") {
      throw new AppError("Private recipes cannot be commented on.", 403);
    }
    const { content } = addCommentDTO;

    const newComment = await databaseClient.db
      .insert(commentsTable)
      .values({ commentedBy: userId, recipeId, content })
      .returning({
        commentId: commentsTable.commentId,
        commentedBy: commentsTable.commentedBy,
        createdAt: commentsTable.createdAt,
      })
      .execute();

    return newComment[0];
  }

  async editComment(
    userId: number,
    commentId: number,
    addCommentDTO: AddCommentDTO,
  ) {
    const existingComment = await databaseClient.db
      .select({
        commentedBy: commentsTable.commentedBy,
        isDeleted: commentsTable.isDeleted,
      })
      .from(commentsTable)
      .where(eq(commentsTable.commentId, commentId))
      .execute();
    if (existingComment.length === 0 || existingComment[0].isDeleted) {
      throw new AppError(
        "Comment with the specified ID does not exist or has been deleted.",
        404,
      );
    }
    if (existingComment[0].commentedBy !== userId) {
      throw new AppError(
        "Authenticated user is not allowed to edit this comment.",
        403,
      );
    }
    const { content } = addCommentDTO;

    const updatedComment = await databaseClient.db
      .update(commentsTable)
      .set({ content, updatedAt: new Date() })
      .where(eq(commentsTable.commentId, commentId))
      .returning({
        commentId: commentsTable.commentId,
        commentedBy: commentsTable.commentedBy,
        content: commentsTable.content,
        createdAt: commentsTable.createdAt,
        updatedAt: commentsTable.updatedAt,
      })
      .execute();

    return updatedComment[0];
  }

  async deleteComment(userId: number, userRole: string, commentId: number) {
    await databaseClient.db.transaction(async (tx) => {
      const existingComment = await tx
        .select({
          commentedBy: commentsTable.commentedBy,
          isDeleted: commentsTable.isDeleted,
        })
        .from(commentsTable)
        .where(eq(commentsTable.commentId, commentId))
        .execute();
      if (existingComment.length === 0 || existingComment[0].isDeleted) {
        throw new AppError(
          "Comment with the specified ID does not exist or has been deleted.",
          404,
        );
      }
      if (existingComment[0].commentedBy !== userId && userRole !== "admin") {
        throw new AppError(
          "Authenticated user is not allowed to delete this comment.",
          403,
        );
      }
      await tx
        .update(commentsTable)
        .set({ isDeleted: true, deletedBy: userId, deletedAt: new Date() })
        .where(eq(commentsTable.commentId, commentId))
        .execute();

      const resolution =
        userRole === "admin" ? "admin_deleted" : "user_deleted";

      await tx
        .update(reportsTable)
        .set({ resolution: resolution, resolvedAt: new Date() })
        .where(
          and(
            eq(reportsTable.commentId, commentId),
            isNull(reportsTable.resolvedAt),
          ),
        )
        .execute();
    });
  }

  async getRecipeComments(userId: number, recipeId: number) {
    const existingRecipe = await checkRecipeExists(recipeId);

    if (
      existingRecipe.visibility === "private" &&
      existingRecipe.creatorId !== userId
    ) {
      throw new AppError(
        "Authenticated user is not allowed to view private recipe's comments",
        403,
      );
    }

    const comments = await databaseClient.db
      .select({
        commentId: commentsTable.commentId,
        content: commentsTable.content,
        commentedBy: commentsTable.commentedBy,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        createdAt: commentsTable.createdAt,
        updatedAt: commentsTable.updatedAt,
        total: sql`count(*) over()`.mapWith(Number),
      })
      .from(commentsTable)
      .innerJoin(usersTable, eq(commentsTable.commentedBy, usersTable.userId))
      .where(
        and(
          eq(commentsTable.recipeId, recipeId),
          eq(commentsTable.isDeleted, false),
        ),
      )
      .orderBy(desc(commentsTable.createdAt))
      .execute();
    return {
      total: comments.length > 0 ? comments[0].total : 0,
      data: comments.map(({ total, ...comment }) => comment),
    };
  }
}

export const commentsService = new CommentsService();
