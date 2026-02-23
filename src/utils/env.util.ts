import dotenv from "dotenv";
import { env as ENV, exit } from "process";
import { Level } from "pino";

class EnvironmentVariables {
    private _environmentVariables: string[];

    constructor() {
        dotenv.config();

        this._environmentVariables = [];
        this._initialize();
        this._validateVariables();

        console.log(`Environment variables loaded.✅`);
    }

    private _initialize() {
        this._environmentVariables = [
            'PORT',
            'DB_URL',
            'LOG_LEVEL',
            'LOG_FILES_DIRECTORY_NAME',
            'LOG_FILE_NAME',
            'DB_HOST',
            'DB_PORT',
            'DB_USER',
            'DB_PASSWORD',
            'DB_NAME'
        ];
    }

    private _validateVariables() {
        const error_messages: string[] = [];

        for (const key of this._environmentVariables) {
            if (!ENV[key]) {
                error_messages.push(`❌ Environment variable ${key} is not set.`);
            }
        }

        if (error_messages.length > 0) {
            console.error(error_messages.join('\n'));
            exit(1);
        }
    }
        
    public get<T = string>(key: string): T {
        if (!this._environmentVariables.includes(key)) {                
            throw new Error(`Environment variable ${key} does not exist.`);
        }
        return ENV[key] as unknown as T;
    }
}

export const env = new EnvironmentVariables();
