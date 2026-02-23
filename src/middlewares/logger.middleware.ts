import { pinoHttp } from 'pino-http';
import { logger } from "@/utils/logger.util";

// exports pino-http middleware configured with our logger instance to automatically log HTTP requests & responses
export const loggerMiddleware = pinoHttp({ logger });
