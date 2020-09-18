import Joi from 'joi';
import { YesNo } from '../../models/YesNo';

const fullNameErrorMessage = 'Full name is required';
const hasPreviousNameMissingMessage = 'Select yes if the applicant has used a different name for business purposes in the last 20 years';
const previousNameMissingMessage = 'Enter previous full names, used for business purposes';
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
  hasPreviousName: Joi.string()
    .required()
    .valid(YesNo.yes, YesNo.no)
    .messages({
      'any.required': hasPreviousNameMissingMessage,
      'any.only': hasPreviousNameMissingMessage,
      'string.base': hasPreviousNameMissingMessage,
      'string.empty': hasPreviousNameMissingMessage
    }),
  previousName: Joi.when('hasPreviousName', {
      is: Joi.valid(YesNo.yes).exist(),
      then: Joi.string().required().pattern(/\w+/).messages({
        'any.required': previousNameMissingMessage,
        'any.only': previousNameMissingMessage,
        'string.base': previousNameMissingMessage,
        'string.empty': previousNameMissingMessage
      })
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
