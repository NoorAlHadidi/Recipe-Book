import z from "zod";

export const signUpSchema = z.object({
    first_name: z.string().min(1, "First name is required.").max(100, "First name must be at most 100 characters long."),
    last_name: z.string().min(1, "Last name is required.").max(100, "Last name must be at most 100 characters long."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters long.").max(128, "Password must be at most 128 characters long."),
});

export const logInSchema = z.object({
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters long.").max(128, "Password must be at most 128 characters long."),
});

export type SignUp = z.infer<typeof signUpSchema>;
export type LogIn = z.infer<typeof logInSchema>;