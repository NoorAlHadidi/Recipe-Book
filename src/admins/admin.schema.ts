import z from "zod";

export const addAdminSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(100, "First name must be at most 100 characters long."),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .max(100, "Last name must be at most 100 characters long."),
  email: z.string().toLowerCase().email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must be at most 128 characters long."),
});

export const grantAdminSchema = z.object({
  userId: z.number().int().positive("Invalid user ID."),
});

export type AddAdminDTO = z.infer<typeof addAdminSchema>;
