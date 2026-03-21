import z from "zod";

export const addUnitSchema = z.object({
  name: z
    .string("Unit name must be a string.")
    .trim()
    .min(1, "Unit name is required.")
    .max(10, "Unit name must be at most 10 characters long.")
    .transform((unit) => unit.toLowerCase()),
});

export const unitParamSchema = z.object({
  unitId: z.coerce
    .number("Unit ID must be a number.")
    .int("Unit ID must be an integer.")
    .positive("Unit ID must be a positive integer."),
});

export type AddUnitDTO = z.infer<typeof addUnitSchema>;