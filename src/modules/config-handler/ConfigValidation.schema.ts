import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  CDN_HOST: Joi.string().required(),
  COOKIE_NAME: Joi.string().required(),
  COOKIE_DOMAIN: Joi.string().required(),
  COOKIE_SECRET: Joi.string().required(),
  CACHE_SERVER: Joi.string().required()
}).options({
  allowUnknown: true
});
