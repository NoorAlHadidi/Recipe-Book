import dotenv from "dotenv";
import { envSchema } from "@/utils/env.schema";

class EnvironmentVariables {

    private _env;

    constructor() {
        dotenv.config();

        const result = this._validateVariables();

        this._env = result.data;

        console.log(`Environment variables loaded.✅`);
    }

    private _validateVariables() {
        const result = envSchema.safeParse(process.env);

        if (!result.success) {
            console.error("❌Environment variables validation failed:");
            console.error(result.error.format());
            process.exit(1);
        }

        return result;
    }

    // ensures key is one of the defined environment variables and returns its value with correct type
    public get<T extends keyof typeof this._env>(key: T) {
        return this._env[key];
    }
}

export const env = new EnvironmentVariables();