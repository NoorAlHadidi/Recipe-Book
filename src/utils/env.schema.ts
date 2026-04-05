import { z } from "zod";

export const envSchema = z.object({
    PORT: z.coerce.number("PORT must be a number.").int("PORT must be an integer.").min(1).max(65535),
    NODE_ENV: z.enum(['development', 'production', 'test'], "NODE_ENV must be a valid environment."),
    DB_URL: z.string().url("DB_URL must be a valid URL."),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'], "LOG_LEVEL must be a valid Pino level."),
    LOG_FILES_DIRECTORY_NAME: z.string("LOG_FILES_DIRECTORY_NAME must be a string."),
    LOG_FILE_NAME: z.string("LOG_FILE_NAME must be a string."),
    DB_HOST: z.string().optional(),
    DB_PORT: z.coerce.number("DB_PORT must be a number.").int("DB_PORT must be an integer.").min(1).max(65535).optional(),
    DB_USER: z.string("DB_USER must be a string.").optional(),
    DB_PASSWORD: z.string("DB_PASSWORD must be a string.").optional(),
    DB_NAME: z.string("DB_NAME must be a string.").optional(),
    ACCESS_TOKEN_SECRET: z.string("ACCESS_TOKEN_SECRET must be a string.").length(128, "ACCESS_TOKEN_SECRET must be exactly 128 characters long.").regex(/^[a-f0-9]+$/, "ACCESS_TOKEN_SECRET must be a hexadecimal string."),
    REFRESH_TOKEN_SECRET: z.string("REFRESH_TOKEN_SECRET must be a string.").length(128, "REFRESH_TOKEN_SECRET must be exactly 128 characters long.").regex(/^[a-f0-9]+$/, "REFRESH_TOKEN_SECRET must be a hexadecimal string."),
    SUPER_ADMIN_PASSWORD: z.string("SUPER_ADMIN_PASSWORD must be a string.")
});