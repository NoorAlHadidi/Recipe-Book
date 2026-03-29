import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { commentParamSchema } from "@/comments";
import {
  addReportSchema,
  reportParamSchema,
  reportQueryParamSchema,
  reportsService,
  resolveReportSchema,
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

  deleteReport = asyncErrorHandler(async (req: Request, res: Response) => {
    const { reportId } = reportParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const userRole = req.user!.role;
    await reportsService.deleteReport(userId, userRole, reportId);
    res.status(204).send();
  });

  getCommentReports = asyncErrorHandler(async (req: Request, res: Response) => {
    const { commentId } = commentParamSchema.parse(req.params);
    const { status } = reportQueryParamSchema.parse(req.query);
    const reports = await reportsService.getCommentReports(
      commentId,
      status,
    );
    res.status(200).json(reports);
  });

  getUserReports = asyncErrorHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const reports = await reportsService.getUserReports(userId);
    res.status(200).json(reports);
  });

  getAllReports = asyncErrorHandler(async (req: Request, res: Response) => {
    const { status } = reportQueryParamSchema.parse(req.query);
    const reports = await reportsService.getAllReports(status);
    res.status(200).json(reports);
  });

  resolveReport = asyncErrorHandler(async (req: Request, res: Response) => {
    const { reportId } = reportParamSchema.parse(req.params);
    const resolveReportDTO = resolveReportSchema.parse(req.body);
    const userId = req.user!.sub;
    await reportsService.resolveReport(
      userId,
      reportId,
      resolveReportDTO,
    );
    res.status(200).json({ message: "Report resolved successfully." });
  });

  getReport = asyncErrorHandler(async (req: Request, res: Response) => {
    const { reportId } = reportParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const userRole = req.user!.role;
    const report = await reportsService.getReport(userId, userRole, reportId);
    res.status(200).json(report);
  });
}

export const reportsController = new ReportsController();
