import { createLogger } from '@companieshouse/structured-logging-node';
import ApplicationLogger from '@companieshouse/structured-logging-node/lib/ApplicationLogger';

let logger: ApplicationLogger;

export const APP_NAME = 'suppression-web';

export function loggerInstance(): ApplicationLogger {
  if (!logger) {
    logger = createLogger(APP_NAME);
  }
  return logger;
}
