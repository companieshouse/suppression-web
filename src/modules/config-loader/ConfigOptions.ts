import * as Joi from 'joi';

export interface ConfigOptions {
  filePath?: string;
  validationSchema?: Joi.ObjectSchema;
}
