import Joi from 'joi';
import { YesNo } from '../../models/YesNo';
import { basicString } from './BasicStringSchemaItem';

const fullNameErrorMessage = 'Enter the applicant’s full name';
const hasPreviousNameMissingMessage = 'Select yes if the applicant has used a different name on the Companies house register in the last 20 years';
const previousNameMissingMessage = 'Enter previous full name';
const emailMissingErrorMessage = 'Email address is required';
const emailInvalidErrorMessage = 'Enter an email address in the correct format, like name@example.com';

const invalidDayErrorMessage: string = 'You must enter a day';
const invalidMonthErrorMessage: string = 'You must enter a month';
const invalidYearErrorMessage: string = 'You must enter a year';

const missingDateErrorMessage: string = 'Enter the applicant’s date of birth';
const invalidDateErrorMessage: string = 'Enter a real date';

const dayMonthRegex: RegExp = /^[0-9]{1,2}$/;
const yearRegex: RegExp = /^[0-9]{4}$/;

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
    })
    .options({ abortEarly: true }),
  previousName: Joi.when('hasPreviousName', {
      is: YesNo.yes,
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
    }),
  day: Joi.string()
    .required()
    .pattern(dayMonthRegex)
    .messages({
      'any.required': invalidDayErrorMessage,
      'string.base': invalidDayErrorMessage,
      'string.empty': invalidDayErrorMessage,
      'string.pattern.base': invalidDayErrorMessage
    }),
  month: Joi.string()
    .required()
    .pattern(dayMonthRegex)
    .messages({
      'any.required': invalidMonthErrorMessage,
      'string.base': invalidMonthErrorMessage,
      'string.empty': invalidMonthErrorMessage,
      'string.pattern.base': invalidMonthErrorMessage
    }),
  year: Joi.string()
    .required()
    .pattern(yearRegex)
    .messages({
      'any.required': invalidYearErrorMessage,
      'string.base': invalidYearErrorMessage,
      'string.empty': invalidYearErrorMessage,
      'string.pattern.base': invalidYearErrorMessage
    }),
  date: Joi.date()
    .required()
    .iso()
    .messages({
      'any.required': missingDateErrorMessage,
      'date.base': invalidDateErrorMessage,
      'date.format': invalidDateErrorMessage
    })
});
