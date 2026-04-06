import z from "zod";
// import { ParamsDictionary } from "express-serve-static-core";

export const addAdminSchema = z.object({
  firstName: z
    .string("Admin first name must be a string.")
    .min(1, "First name is required.")
    .max(100, "First name must be at most 100 characters long."),
  lastName: z
    .string("Admin last name must be a string.")
    .min(1, "Last name is required.")
    .max(100, "Last name must be at most 100 characters long."),
  email: z.string().toLowerCase().email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must be at most 128 characters long."),
});

export const changePrivilegeSchema = z.object({
  role: z.enum(["user", "admin"], "Role must be either user or admin."),
});

export const userIdParamSchema = z.object({
  userId: z.coerce
    .number({ error: "User ID must be a number." })
    .int("User ID must be an integer.")
    .positive("User ID must be a positive integer."),
  // userId: z.string().regex(/^\d+$/, "User ID must be a positive integer."),
});
