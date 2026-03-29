import z from "zod";

export const addReportSchema = z.object({
  content: z
    .string("Content must be a string.")
    .trim()
    .min(1, "Content is required.")
    .max(500, "Content must be at most 500 characters long."),
});

export const reportParamSchema = z.object({
  commentId: z.coerce
    .number("Report ID must be a number.")
    .int("Report ID must be an integer.")
    .positive("Report ID must be a positive integer."),
});

export const reportQueryParamSchema = z.object({
  status: z
    .enum(
      ["open", "closed", "all"],
      "Report status must be open, closed, or all.",
    )
    .default("all"),
});

export type AddReportDTO = z.infer<typeof addReportSchema>;
