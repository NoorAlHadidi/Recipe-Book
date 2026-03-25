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
  steps: z
    .array(
      z
        .string("Steps must be strings.")
        .trim()
        .min(1, "Step is required.")
        .max(500, "Steps must be at most 500 characters."),
    )
    .optional(),
});

export const editRecipeSchema = z
  .object({
    title: z
      .string("Recipe title must be a string.")
      .trim()
      .min(1, "Recipe title cannot be empty.")
      .max(100, "Recipe title must be at most 100 characters long.")
      .optional(),
    description: z
      .string("Recipe description must be a string.")
      .trim()
      .min(1, "Recipe description cannot be empty.")
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

export const addRecipeStepsSchema = z.object({
  steps: z.array(
    z
      .string("Step instruction must be a string.")
      .trim()
      .min(1, "Step instruction cannot be empty.")
      .max(500, "Step instruction must be at most 500 characters."),
  ),
});

export const editRecipeStepSchema = z.object({
  instruction: z
    .string("Step instruction must be a string.")
    .trim()
    .min(1, "Step instruction cannot be empty.")
    .max(500, "Step instruction must be at most 500 characters."),
});

export const recipeParamSchema = z.object({
  recipeId: z.coerce
    .number("Recipe ID must be a number.")
    .int("Recipe ID must be an integer.")
    .positive("Recipe ID must be a positive integer."),
});

export const recipeStepParamSchema = z.object({
  recipeId: z.coerce
    .number("Recipe ID must be a number.")
    .int("Recipe ID must be an integer.")
    .positive("Recipe ID must be a positive integer."),
  stepNumber: z.coerce
    .number("Step number must be a number.")
    .int("Step number must be an integer.")
    .positive("Step number must be a positive integer."),
});

export const recipeQueryParamsSchema = z.object({
  page: z.coerce
    .number("Page must be a number.")
    .int("Page must be an integer.")
    .positive("Page must be a positive integer."),
  limit: z.coerce
    .number("Limit must be a number.")
    .int("Limit must be an integer.")
    .positive("Limit must be a positive integer."),
  title: z
    .string("Title must be a string.")
    .trim()
    .min(1, "Title field cannot be empty.")
    .optional(),
  creatorId: z.coerce
    .number("Creator ID must be a number.")
    .int("Creator ID must be an integer.")
    .positive("Creator ID must be a positive integer.")
    .optional(),
  categoryId: z.coerce
    .number("Category ID must be a number.")
    .int("Category ID must be an integer.")
    .positive("Category ID must be a positive integer.")
    .optional(),
  tagId: z.coerce
    .number("Tag ID must be a number.")
    .int("Tag ID must be an integer.")
    .positive("Tag ID must be a positive integer.")
    .optional(),
});

export type AddRecipeDTO = z.infer<typeof addRecipeSchema>;
export type EditRecipeDTO = z.infer<typeof editRecipeSchema>;
export type AddRecipeStepsDTO = z.infer<typeof addRecipeStepsSchema>;
export type EditRecipeStepDTO = z.infer<typeof editRecipeStepSchema>;
export type RecipeQueryParamDTO = z.infer<typeof recipeQueryParamsSchema>;
