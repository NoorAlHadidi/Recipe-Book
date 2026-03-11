import z from "zod";

export const addCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required.")
    .max(100, "Category name must be at most 100 characters long."),
  description: z.string().optional(),
});

export type AddCategoryDTO = z.infer<typeof addCategorySchema>;