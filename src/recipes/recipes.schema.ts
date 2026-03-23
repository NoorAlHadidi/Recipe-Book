import z from "zod";

export const addRecipeSchema = z.object({
  title: z
    .string("Recipe title must be a string.")
    .trim()
    .min(1, "Recipe title is required.")
    .max(100, "Recipe title must be at most 100 characters long."),
  description: z
    .string("Recipe description must be a string.")
    .trim()
    .max(500, "Recipe description must be at most 500 characters long.")
    .optional(),
  visibility: z
    .enum(["private", "public"], "Visibility must be either public or private.")
    .default("public"),
  categoryId: z.coerce
    .number("Category ID must be a number.")
    .int("Category ID must be an integer.")
    .positive("Category ID must be a positive integer."),
});

export const editRecipeSchema = z
  .object({
    title:  z
    .string("Recipe title must be a string.")
    .trim()
    .max(100, "Recipe title must be at most 100 characters long.")
    .optional(),
    description: z
    .string("Recipe description must be a string.")
    .trim()
    .max(500, "Recipe description must be at most 500 characters long.")
    .optional(),
    visibility: z
    .enum(["private", "public"], "Visibility must be either public or private.").optional(),
    categoryId: z.coerce
    .number("Category ID must be a number.")
    .int("Category ID must be an integer.")
    .positive("Category ID must be a positive integer.").optional(),
  })
  .refine((body) => body.title !== undefined || body.description !== undefined || body.visibility !== undefined || body.categoryId !== undefined, {
    message: "At least one field must be provided.",
  });

export const recipeParamSchema = z.object({
  recipeId: z.coerce
    .number("Recipe ID must be a number.")
    .int("Recipe ID must be an integer.")
    .positive("Recipe ID must be a positive integer."),
});

export type AddRecipeDTO = z.infer<typeof addRecipeSchema>;
export type EditRecipeDTO = z.infer<typeof editRecipeSchema>;