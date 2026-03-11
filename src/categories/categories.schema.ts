import z from "zod";

export const addCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(100, "Category name must be at most 100 characters long.")
    .transform((category) => category.toLowerCase()),
  description: z.string().optional(),
});

export type AddCategoryDTO = z.infer<typeof addCategorySchema>;