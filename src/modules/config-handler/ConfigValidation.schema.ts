import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  CDN_HOST: Joi.string().required(),
  CHS_URL: Joi.string().required(),
  SUPPRESSIONS_API_URL : Joi.string().required(),
  PAYMENTS_API_URL : Joi.string().required(),
  COOKIE_NAME: Joi.string().required(),
  COOKIE_DOMAIN: Joi.string().required(),
  COOKIE_SECRET: Joi.string().required(),
  CACHE_SERVER: Joi.string().required(),
  COOKIE_EXPIRATION_IN_SECONDS: Joi.string().required(),
  DOCUMENT_AMENDMENT_FEE: Joi.number().required(),
  PROCESSING_DELAY_EVENT: Joi.string(),
  PIWIK_URL: Joi.string().required(),
  PIWIK_SITE_ID: Joi.string().required(),
  PIWIK_LANDING_PAGE_START_GOAL_ID: Joi.string().required(),
  OAUTH2_CLIENT_ID: Joi.string().required(),
  OAUTH2_CLIENT_SECRET: Joi.string().required(),
  OAUTH2_TOKEN_URI: Joi.string().required()
}).options({
  allowUnknown: true
});
