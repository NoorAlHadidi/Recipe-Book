import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { commentParamSchema } from "@/comments";
import {
  addReportSchema,
  reportQueryParamSchema,
  reportsService,
} from "@/reports";

class ReportsController {
  addReport = asyncErrorHandler(async (req: Request, res: Response) => {
    const addReportDTO = addReportSchema.parse(req.body);
    const { commentId } = commentParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const newReport = await reportsService.addReport(
      userId,
      commentId,
      addReportDTO,
    );
    res.status(201).json(newReport);
  });

  getCommentReports = asyncErrorHandler(async (req: Request, res: Response) => {
    const { commentId } = commentParamSchema.parse(req.params);
    const status = reportQueryParamSchema.parse(req.query);
    const userRole = req.user!.role;
    const reports = await reportsService.getCommentReports(
      userRole,
      commentId,
      String(status),
    );
    res.status(200).json(reports);
  });
}

export const reportsController = new ReportsController();
