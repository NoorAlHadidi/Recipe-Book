import z from "zod";

export const categoryParamSchema = z.object({
  categoryId: z.coerce
    .number("Category ID must be a number.")
    .int("Category ID must be an integer.")
    .positive("Category ID must be a positive integer."),
});

export const addCategorySchema = z.object({
  name: z
    .string("Category name must be a string.")
    .trim()
    .min(1, "Category name is required.")
    .max(100, "Category name must be at most 100 characters long.")
    .toLowerCase(),
  description: z
    .string("Category description must be a string.")
    .trim()
    .optional(),
});

export const editCategorySchema = z
  .object({
    name: z
      .string("Category name must be a string.")
      .trim()
      .min(1, "Category name cannot be empty.")
      .max(100, "New category name must be at most 100 characters long.")
      .toLowerCase()
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

export const categoryQueryParamsSchema = z
  .object({
    page: z.coerce
      .number("Page must be a number.")
      .int("Page must be an integer.")
      .positive("Page must be a positive integer.")
      .optional(),
    limit: z.coerce
      .number("Limit must be a number.")
      .int("Limit must be an integer.")
      .positive("Limit must be a positive integer.")
      .optional(),
    name: z
      .string("Category name must be a string.")
      .trim()
      .min(1, "Category name field cannot be empty.")
      .optional(),
  })
  .refine((body) => (body.page === undefined) === (body.limit === undefined), {
    message: "Must provide both page and limit parameter for pagination.",
  });

export type AddCategoryDTO = z.infer<typeof addCategorySchema>;
export type EditCategoryDTO = z.infer<typeof editCategorySchema>;
export type CategoryQueryParamDTO = z.infer<typeof categoryQueryParamsSchema>;
