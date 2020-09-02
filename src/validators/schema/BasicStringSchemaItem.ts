import Joi from 'joi';

export function basicString(errorMessage: string): Joi.StringSchema {
  return Joi.string()
    .required()
    .pattern(/\w+/)
    .messages({
      'any.required': errorMessage,
      'string.base': errorMessage,
      'string.empty': errorMessage,
      'string.pattern.base': errorMessage
    })
}
