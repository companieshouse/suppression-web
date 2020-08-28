import Joi from 'joi';

const fullNameErrorMessage = 'Full name is required';
const emailMissingErrorMessage = 'Email address is required';
const emailInvalidErrorMessage = 'Enter an email address in the correct format, like name@example.com'

export const schema = Joi.object({
  fullName: Joi.string()
    .required()
    .pattern(/\w+/)
    .messages({
      'any.required': fullNameErrorMessage,
      'string.base': fullNameErrorMessage,
      'string.empty': fullNameErrorMessage,
      'string.pattern.base': fullNameErrorMessage
    }),
  emailAddress: Joi.string()
    .required()
    .email()
    .messages({
      'any.required': emailMissingErrorMessage,
      'string.base': emailMissingErrorMessage,
      'string.empty': emailMissingErrorMessage,
      'string.email': emailInvalidErrorMessage
    })
});
