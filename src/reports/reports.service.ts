import {
  databaseClient,
  usersTable,
  commentsTable,
  reportsTable,
} from "@/database";
import { eq, and, desc, sql, isNull, isNotNull } from "drizzle-orm";
import { checkRecipeExists } from "@/recipes";
import { AppError } from "@/errors";
import { AddCommentDTO } from "@/comments";
import { AddReportDTO } from "@/reports";

class ReportsService {
  async addReport(
    userId: number,
    commentId: number,
    addReportDTO: AddReportDTO,
  ) {
    const existingComment = await databaseClient.db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.commentId, commentId))
      .execute();
    if (existingComment.length === 0 || existingComment[0].isDeleted) {
      throw new AppError(
        "Comment with the specified ID does not exist or has been deleted.",
        404,
      );
    }

    const existingReport = await databaseClient.db
      .select()
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.commentId, commentId),
          eq(reportsTable.reportedBy, userId),
        ),
      )
      .execute();
    if (existingReport.length > 0) {
      throw new AppError(
        "Authenticated user has already reported this comment.",
        409,
      );
    }

    const { content } = addReportDTO;

    const newReport = await databaseClient.db
      .insert(reportsTable)
      .values({ reportedBy: userId, commentId, content })
      .returning({
        reportId: reportsTable.reportId,
        commentId: reportsTable.commentId,
        reportedBy: reportsTable.reportedBy,
        content: reportsTable.content,
        createdAt: reportsTable.createdAt,
      })
      .execute();

    return newReport[0];
  }

  async getCommentReports(userRole: string, commentId: number, status: string) {
    const existingComment = await databaseClient.db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.commentId, commentId))
      .execute();
    if (existingComment.length === 0 || existingComment[0].isDeleted) {
      throw new AppError(
        "Comment with the specified ID does not exist or has been deleted.",
        404,
      );
    }

    if (userRole !== "admin") {
      throw new AppError("Non-admin user cannot view reports.", 403);
    }

    const statusCondition =
      status === "open"
        ? and(
            eq(reportsTable.commentId, commentId),
            isNull(reportsTable.resolvedAt),
          )
        : status === "closed"
          ? and(
              eq(reportsTable.commentId, commentId),
              isNotNull(reportsTable.resolvedAt),
            )
          : eq(reportsTable.commentId, commentId);

    const reports = await databaseClient.db
      .select({
        reportId: reportsTable.reportId,
        reportedBy: reportsTable.reportedBy,
        commentId: reportsTable.commentId,
        content: reportsTable.content,
        createdAt: reportsTable.createdAt,
        status: reportsTable.resolution,
      })
      .from(reportsTable)
      .where(statusCondition)
      .orderBy(desc(reportsTable.createdAt))
      .execute();

    return reports.map((report) => ({
      ...report,
      status: report.status ?? "open",
    }));
  }
}

export const reportsService = new ReportsService();
