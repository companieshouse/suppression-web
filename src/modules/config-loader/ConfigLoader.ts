import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';
import { resolve } from 'path';

import { ConfigOptions } from './ConfigOptions';

export function loadEnvironmentVariables(configOptions?: ConfigOptions): void {

  const envVarFilePath: string = configOptions?.filePath || resolve(process.cwd(), `.env.${get('NODE_ENV')}`);

  let config: Record<string, any> = {};
  if (fs.existsSync(envVarFilePath)) {
    config = dotenv.parse(fs.readFileSync(envVarFilePath));
  }

  config = {...config, ...process.env};

  if (configOptions?.validationSchema) {
    config = validate(config, configOptions.validationSchema);
  }

  saveToProcessEnv(config);
}

function validate(config: Record<string, any>, schema: Joi.ObjectSchema): Record<string, any> {
  const { error, value } = schema.validate(config);

  if (error) {
    throw new Error(`Config validation error: ${error}`);
  }
  return value;
}

function saveToProcessEnv(config: Record<string, any>): void {
  Object.keys(config)
    .filter(key => !(key in process.env))
    .forEach(key => (process.env[key] = config[key]));
}

export function get(key: string): string | undefined {
  return process.env[key];
}

export function getOrDefault(key: string, defaultValue: string): string {
  const value = get(key);
  if (value) {
    return value;
  }
  return defaultValue;
}
