import z from "zod";

export const addRatingSchema = z.object({
  rating: z
    .number("Rating must be a number.")
    .int("Rating must be an integer.")
    .positive("Rating must be a positive integer.")
    .min(1, "Rating cannot be less than 1.")
    .max(5, "Rating cannot exceed 5.")
});

export type AddRatingDTO = z.infer<typeof addRatingSchema>;