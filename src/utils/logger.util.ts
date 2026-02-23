import pino, { type Logger as PinoLoggerType } from 'pino';
import { loggerConfiguration } from '@/config';

class Logger {
    private _logger: PinoLoggerType;

    get logger(): PinoLoggerType {
        return this._logger;
    }
    
    constructor() {
        this._logger = pino(loggerConfiguration);
        this._logger.debug('Pino logger initialized. 🪵')
    }
}

// exports logger instance to be used across the application
export const logger = new Logger().logger;