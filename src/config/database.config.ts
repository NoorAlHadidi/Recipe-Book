import { env } from "@/utils";

export const databaseConfiguration = {
    connectionString: env.get('DB_URL'),
};