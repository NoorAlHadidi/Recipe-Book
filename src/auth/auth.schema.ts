import z from "zod";

export const signUpSchema = z.object({
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

export const logInSchema = z.object({
  email: z.string().toLowerCase().email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must be at most 128 characters long."),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required."),
});

export type SignUpDTO = z.infer<typeof signUpSchema>;
export type LogInDTO = z.infer<typeof logInSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
