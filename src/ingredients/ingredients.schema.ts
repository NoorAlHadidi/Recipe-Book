import z from "zod";

export const ingredientParamSchema = z.object({
  ingredientId: z.coerce
    .number("Ingredient ID must be a number.")
    .int("Ingredient ID must be an integer.")
    .positive("Ingredient ID must be a positive integer."),
});

export const addIngredientSchema = z.object({
  name: z
    .string("Ingredient name must be a string.")
    .trim()
    .min(1, "Ingredient name is required.")
    .max(100, "Ingredient name must be at most 100 characters long.")
    .transform((ingredient) => ingredient.toLowerCase()),
});

export const editIngredientSchema = z.object({
  name: z
    .string("Ingredient name must be a string.")
    .trim()
    .min(1, "Ingredient name is required.")
    .max(100, "Ingredient name must be at most 100 characters long.")
    .transform((ingredient) => ingredient.toLowerCase()),
});

export const addIngredientUnitSchema = z.object({
  unitId: z.coerce
    .number("Unit ID must be a number.")
    .int("Unit ID must be an integer.")
    .positive("Unit ID must be a positive integer."),
});

export const ingredientUnitParamSchema = z.object({
  ingredientId: z.coerce
    .number("Ingredient ID must be a number.")
    .int("Ingredient ID must be an integer.")
    .positive("Ingredient ID must be a positive integer"),
  unitId: z.coerce
    .number("Unit ID must be a number.")
    .int("Unit ID must be an integer.")
    .positive("Unit ID must be a positive integer"),
});

export const ingredientQueryParamsSchema = z
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
      .string("Ingredient name must be a string.")
      .trim()
      .min(1, "Ingredient name field cannot be empty.")
      .optional(),
  })
  .refine((body) => (body.page === undefined) === (body.limit === undefined), {
    message: "Must provide both page and limit parameter for pagination.",
  });

export type AddIngredientDTO = z.infer<typeof addIngredientSchema>;
export type EditIngredientDTO = z.infer<typeof editIngredientSchema>;
export type AddIngredientUnitDTO = z.infer<typeof addIngredientUnitSchema>;
export type IngredientQueryParamDTO = z.infer<
  typeof ingredientQueryParamsSchema
>;
