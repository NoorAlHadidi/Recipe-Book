import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseConfiguration } from "@/config";
import { logger } from "@/utils";

class DatabaseClient {
    private _pool: Pool;
    private _db;

    constructor() {
        this._pool = new Pool({
            connectionString: databaseConfiguration.connectionString,
        });

        this._db = drizzle(this._pool);
    }

    get db() {
        return this._db;
    }

    async connect(): Promise<void> {
        try {
            await this._pool.connect();
            logger.info("Database connected successfully.✅");
        }   
        catch (error: any) {
            logger.error("Database connection failed.❌", error.message);
            process.exit(1);
        }
    }

    async disconnect(): Promise<void> {
        await this._pool.end();
    }
}

export const databaseClient = new DatabaseClient();
