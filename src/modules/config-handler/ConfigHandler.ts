import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';

import { ConfigOptions } from './ConfigOptions';
export function loadEnvironmentVariables(configOptions?: ConfigOptions): void {

  const envVarFilePath = configOptions?.customFilePath ? configOptions.customFilePath : getNodeEnvFilePath();

  let config: Record<string, any> = {};
  if (envVarFilePath && fs.existsSync(envVarFilePath)) {
    config = dotenv.parse(fs.readFileSync(envVarFilePath));
  }

  config = {...config, ...process.env};

  if (configOptions?.validationSchema) {
    config = validate(config, configOptions.validationSchema);
  }

  saveToProcessEnv(config);
}

function getNodeEnvFilePath(): string | undefined {
  const env: string | undefined = getConfigValue('NODE_ENV');
  if (env === undefined) {
    return;
  }
  const envFilePath = `${__dirname}/../../../.env.${env}`;
  dotenv.config({path: envFilePath});
  return envFilePath;
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

export function getConfigValue(key: string): string | undefined {
  return process.env[key];
}

export function getConfigValueOrThrow(key: string): string {
  const value = getConfigValue(key);
  if (value === undefined) {
    throw new Error(`Variable ${key} was not found`);
  }
  return value;
}

export function getConfigValueOrDefault(key: string, defaultValue: string): string {
  const value = getConfigValue(key);
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}
