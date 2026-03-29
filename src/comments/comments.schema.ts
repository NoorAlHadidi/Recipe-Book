import z from "zod";

export const addCommentSchema = z.object({
  content: z
    .string("Content must be a string.")
    .trim()
    .min(1, "Content is required.")
    .max(500, "Content must be at most 500 characters long."),
});

export const commentParamSchema = z.object({
  commentId: z.coerce
    .number("Comment ID must be a number.")
    .int("Comment ID must be an integer.")
    .positive("Comment ID must be a positive integer."),
});

export type AddCommentDTO = z.infer<typeof addCommentSchema>;
