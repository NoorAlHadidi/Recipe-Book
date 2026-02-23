import dotenv from "dotenv";
import { env as ENV, exit } from "process";
import { Level } from "pino";

class EnvironmentVariables {
    private _environmentVariables: string[];

    private _optionalVariables: string[];

    constructor() {
        dotenv.config();

        this._environmentVariables = [];
        this._optionalVariables = [];
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

        this._optionalVariables = [
            'DB_HOST',
            'DB_PORT',
            'DB_USER',
            'DB_PASSWORD',
            'DB_NAME'
        ];
    }

    private _validateValue(key: string, value: string): string | null {
        if (key.includes('PORT') && isNaN(Number(value))) {
            return `${key} must be a valid number.`;
        }   
        if (key.includes('URL')) {
            try {
                new URL(value); // Throws error if invalid
            }   
            catch {
                return `${key} must be a valid URL.`;
            }
        }
        if (key === 'LOG_LEVEL') {
            const allowedLevels: Level[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
            if (!allowedLevels.includes(value as Level)) {
                return `${key} must be one of: ${allowedLevels.join(', ')}`;
            }
        }
        return null;
    }

    private _validateVariables() {
        const error_messages: string[] = [];

        for (const key of this._environmentVariables) {

            const value = ENV[key]; 

            if (this._optionalVariables.includes(key) && !value) {
                continue;
            }

            if (!value) {
                error_messages.push(`❌ Environment variable ${key} is not set.`);
                continue; 
            }

            const validationError = this._validateValue(key, value);

            if (validationError) {
                error_messages.push(`❌ ${validationError}`);
            }
        }

        if (error_messages.length > 0) {
            console.error(error_messages.join('\n'));
            exit(1); 
        }
    }

    public get<T = string>(key: string): T {
        if (!this._environmentVariables.includes(key)) {
            throw new Error(`Environment variable ${key} does not exist in _initialize().`);
        }

        return ENV[key] as unknown as T;
    }
}

export const env = new EnvironmentVariables();