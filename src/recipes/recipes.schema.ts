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
  tagNames: z
    .array(
      z
        .string("Tag name must be a string.")
        .trim()
        .toLowerCase()
        .min(1, "Tag name is required.")
        .max(100, "Tag must be at most 100 characters long."),
    )
    .transform((tagNames) => [...new Set(tagNames)])
    .optional(),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.coerce
          .number("Ingredient ID must be a number.")
          .int("Ingredient ID must be an integer.")
          .positive("Ingredient ID must be a positive integer."),
        quantity: z.coerce
          .number("Quantity must be a number.")
          .positive("Quantity must be a positive number."),
        unitId: z.coerce
          .number("Unit ID must be a number.")
          .int("Unit ID must be an integer.")
          .positive("Unit ID must be a positive integer."),
        notes: z
          .string("Notes must be a string.")
          .max(500, "Notes must be at most 500 characters long.")
          .optional(),
      }),
    )
    .optional(),
});

export const editRecipeSchema = z
  .object({
    title: z
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
      .enum(
        ["private", "public"],
        "Visibility must be either public or private.",
      )
      .optional(),
    categoryId: z.coerce
      .number("Category ID must be a number.")
      .int("Category ID must be an integer.")
      .positive("Category ID must be a positive integer.")
      .optional(),
    tagNames: z
      .array(
        z
          .string("Tag name must be a string.")
          .trim()
          .toLowerCase()
          .min(1, "Tag name is required.")
          .max(100, "Tag must be at most 100 characters long"),
      )
      .transform((tagNames) => [...new Set(tagNames)])
      .optional(),
    ingredients: z
      .array(
        z.object({
          ingredientId: z.coerce
            .number("Ingredient ID must be a number.")
            .int("Ingredient ID must be an integer.")
            .positive("Ingredient ID must be a positive integer."),
          quantity: z.coerce
            .number("Quantity must be a number.")
            .positive("Quantity must be a positive number."),
          unitId: z.coerce
            .number("Unit ID must be a number.")
            .int("Unit ID must be an integer.")
            .positive("Unit ID must be a positive integer."),
          notes: z
            .string("Notes must be a string.")
            .max(500, "Notes must be at most 500 characters long.")
            .optional(),
        }),
      )
      .optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.description !== undefined ||
      body.visibility !== undefined ||
      body.categoryId !== undefined ||
      body.tagNames !== undefined ||
      body.ingredients !== undefined,
    {
      message: "At least one field must be provided.",
    },
  );

export const recipeParamSchema = z.object({
  recipeId: z.coerce
    .number("Recipe ID must be a number.")
    .int("Recipe ID must be an integer.")
    .positive("Recipe ID must be a positive integer."),
});

export type AddRecipeDTO = z.infer<typeof addRecipeSchema>;
export type EditRecipeDTO = z.infer<typeof editRecipeSchema>;
