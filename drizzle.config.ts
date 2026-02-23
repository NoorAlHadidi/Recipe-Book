import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    schema: "./src/database/schema.ts",
    out: "./drizzle/migrations", // directory to store generated migration files
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    strict: true, // security precaution for migrations (prevent major changes without confirmation)
    verbose: true, // to log generated SQL queries (tell us what will change when migrating)
});