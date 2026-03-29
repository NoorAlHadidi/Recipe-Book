import { databaseClient, commentsTable, reportsTable } from "@/database";
import { eq, and, desc, sql, isNull, isNotNull } from "drizzle-orm";
import { AppError } from "@/errors";
import { AddReportDTO, ResolveReportDTO } from "@/reports";

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

  async deleteReport(userId: number, userRole: string, reportId: number) {
    const existingReport = await databaseClient.db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.reportId, reportId))
      .execute();
    if (existingReport.length === 0) {
      throw new AppError("Report with the specified ID does not exist.", 404);
    }
    if (existingReport[0].reportedBy !== userId && userRole !== "admin") {
      throw new AppError(
        "Authenticated user is not allowed to delete this report.",
        403,
      );
    }

    await databaseClient.db
      .delete(reportsTable)
      .where(eq(reportsTable.reportId, reportId))
      .execute();
  }

  async getCommentReports(commentId: number, status: string) {
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

  async getUserReports(userId: number) {
    const reports = await databaseClient.db
      .select({
        reportId: reportsTable.reportId,
        commentId: reportsTable.commentId,
        content: reportsTable.content,
        createdAt: reportsTable.createdAt,
        status: reportsTable.resolution,
      })
      .from(reportsTable)
      .where(eq(reportsTable.reportedBy, userId))
      .orderBy(desc(reportsTable.createdAt))
      .execute();

    return reports.map((report) => ({
      ...report,
      status: report.status ?? "open",
    }));
  }

  async getAllReports(status: string) {
    const statusCondition =
      status === "open"
        ? isNull(reportsTable.resolvedAt)
        : status === "closed"
          ? isNotNull(reportsTable.resolvedAt)
          : undefined;

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

  async resolveReport(
    userId: number,
    reportId: number,
    resolveReportDTO: ResolveReportDTO,
  ) {
    const existingReport = await databaseClient.db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.reportId, reportId))
      .execute();
    if (existingReport.length === 0) {
      throw new AppError("Report with the specified ID does not exist.", 404);
    }

    if (existingReport[0].resolvedAt) {
      throw new AppError("Report has already been resolved.", 409);
    }

    const { action } = resolveReportDTO;
    const commentId = existingReport[0].commentId;
    const resolution = action === "delete" ? "admin_deleted" : "kept";
    await databaseClient.db.transaction(async (tx) => {
      await tx
        .update(reportsTable)
        .set({ resolution, resolvedAt: new Date() })
        .where(eq(reportsTable.reportId, reportId))
        .execute();
      if (action === "delete") {
        await tx
          .update(commentsTable)
          .set({ isDeleted: true, deletedBy: userId, deletedAt: new Date() })
          .where(eq(commentsTable.commentId, commentId))
          .execute();
      }
    });
  }

  async getReport(userId: number, userRole: string, reportId: number) {
    const existingReport = await databaseClient.db
      .select({
        reportId: reportsTable.reportId,
        reportedBy: reportsTable.reportedBy,
        commentId: reportsTable.commentId,
        content: reportsTable.content,
        createdAt: reportsTable.createdAt,
        status: reportsTable.resolution,
      })
      .from(reportsTable)
      .where(eq(reportsTable.reportId, reportId))
      .execute();

    if (existingReport.length === 0) {
      throw new AppError("Report with the specified ID does not exist.", 404);
    }

    if (existingReport[0].reportedBy !== userId && userRole !== "admin") {
      throw new AppError(
        "Authenticated user is not allowed to view this report.",
        403,
      );
    }
    
    return {
      ...existingReport[0],
      status: existingReport[0].status ?? "open",
    };
  }
}

export const reportsService = new ReportsService();
