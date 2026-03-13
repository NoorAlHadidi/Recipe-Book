import z from "zod";

export const addCategorySchema = z.object({
  name: z
    .string("Category name must be a string.")
    .trim()
    .min(1, "Category name is required.")
    .max(100, "Category name must be at most 100 characters long.")
    .transform((category) => category.toLowerCase()),
  description: z
    .string("Category description must be a string.")
    .trim()
    .optional(),
});

export const categoryParamSchema = z.object({
  categoryId: z.coerce
    .number("Category ID must be a number.")
    .int("Category ID must be an integer.")
    .positive("Category ID must be a positive integer."),
});

export const editCategorySchema = z
  .object({
    name: z
      .string("Category name must be a string.")
      .trim()
      .min(1, "Category name cannot be empty.")
      .max(100, "New category name must be at most 100 characters long.")
      .transform((category) => category.toLowerCase())
      .optional(),

    description: z
      .string("Category description must be a string.")
      .trim()
      .min(1, "Description cannot be empty.")
      .optional(),
  })
  .refine((body) => body.name !== undefined || body.description !== undefined, {
    message: "At least one field (name or description) must be provided.",
  });

export type AddCategoryDTO = z.infer<typeof addCategorySchema>;
export type EditCategoryDTO = z.infer<typeof editCategorySchema>;
