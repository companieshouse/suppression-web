import * as Joi from 'joi';

export interface ConfigOptions {
  customFilePath?: string;
  validationSchema?: Joi.ObjectSchema;
}
