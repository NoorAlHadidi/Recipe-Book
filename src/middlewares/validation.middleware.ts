import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateData = (
  schema: z.ZodTypeAny,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      next(error);
    }
  };
};
