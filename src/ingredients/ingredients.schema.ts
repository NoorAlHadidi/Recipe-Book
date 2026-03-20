import z from "zod";

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

export const ingredientParamSchema = z.object({
  ingredientId: z.coerce
    .number("Ingredient ID must be a number.")
    .int("Ingredient ID must be an integer.")
    .positive("Ingredient ID must be a positive integer."),
});

export type AddIngredientDTO = z.infer<typeof addIngredientSchema>;
export type EditIngredientDTO = z.infer<typeof editIngredientSchema>;