import Joi from 'joi';
import { YesNo } from '../../models/YesNo';
import { basicString } from './BasicStringSchemaItem';

const fullNameErrorMessage = 'Full name is required';
const hasPreviousNameMissingMessage = 'Select yes if the applicant has used a different name for business purposes in the last 20 years';
const previousNameMissingMessage = 'Enter previous full names, used for business purposes';
const emailMissingErrorMessage = 'Email address is required';
const emailInvalidErrorMessage = 'Enter an email address in the correct format, like name@example.com'

export const schema = Joi.object({
  fullName: basicString(fullNameErrorMessage),
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
      then: basicString(previousNameMissingMessage)
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
