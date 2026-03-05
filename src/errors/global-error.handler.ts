import { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "@/utils";
import { AppError } from "@/errors";
import { ZodError } from "zod";

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      status: "error",
      message: "Invalid input data",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof AppError) {
    const stack =
      err.stack
        ?.split("\n")
        .slice(0, 2)
        .map((line) => line.trim())
        .join(" ") || "";
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      details: err.details,
      stack: env.get("NODE_ENV") === "development" ? stack : undefined,
    });
    return;
  }

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    stack: env.get("NODE_ENV") === "development" ? err.stack : undefined,
  });
}

export const asyncErrorHandler =
  (
    controllerFunction: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(controllerFunction(req, res, next)).catch(next);
  };
