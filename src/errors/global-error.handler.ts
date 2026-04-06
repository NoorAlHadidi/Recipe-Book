import type { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "@/utils";
import { AppError } from "@/errors";
import { z, ZodError } from "zod";

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Invalid input data",
      details: z.treeifyError(err),
    });
  }

  if (err instanceof AppError) {
    const stack =
      err.stack
        ?.split("\n")
        .slice(0, 2)
        .map((line) => line.trim())
        .join(" ") || "";
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      details: err.details,
      stack: env.get("NODE_ENV") === "development" ? stack : undefined,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    stack: env.get("NODE_ENV") === "development" ? err.stack : undefined,
  });
}

// error handling works by calling next(error), which passes the error to global error handler
// for synchronous code, if error thrown, express catches it automatically and forwards it to global error handler
// old express: for async code, rejected promises are not automatically caught, this is why asyncErrorHandler is needed (wraps async function so that rejection is caught and forwarded to next() - which triggers global error handler)
// new express: async errors are automatically caught and forwarded to next()

export const asyncErrorHandler =
  (
    controllerFunction: (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<any>,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(controllerFunction(req, res, next)).catch(next);
  };