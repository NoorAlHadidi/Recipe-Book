import { env } from '@/utils';
import { join } from 'path';
import { LoggerOptions } from 'pino';
import { cwd } from 'process';


export const loggerConfiguration: LoggerOptions = {
    level: env!.logLevel,
    transport: {
        targets: [
            {
                level: env!.logLevel, // minimum log level for console output
                target: 'pino-pretty', // console output (pretty print) for development
                options: { colorize: true, singleLine: true },
            },
            {
                target: 'pino/file', // log to file for production
                level: 'info', // minimum log level for file output (info and above)
                options: {
                    destination: join(cwd(), env.logFilesDirectoryName, env.logFileName),
                    mkdir: true
                }
            }
        ]
    }
};