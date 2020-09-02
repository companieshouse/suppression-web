import * as Joi from 'joi';

const companyNameErrorMessage: string = 'Company name is required';
const companyNumberErrorMessage: string = 'Company number is required';
const descriptionErrorMessage: string = 'Document description is required';

const invalidDayErrorMessage: string = 'You must enter a day';
const invalidMonthErrorMessage: string = 'You must enter a month';
const invalidYearErrorMessage: string = 'You must enter a year';

const missingDateErrorMessage: string = 'Document date is required';
const invalidDateErrorMessage: string = 'Enter a real date';

const dayMonthRegex: RegExp = /^[0-9]{1,2}$/;
const yearRegex: RegExp = /^[0-9]{4}$/;

export const schema = Joi.object({
  companyName: Joi.string()
    .required()
    .pattern(/\w+/)
    .messages({
      'any.required': companyNameErrorMessage,
      'string.base': companyNameErrorMessage,
      'string.empty': companyNameErrorMessage,
      'string.pattern.base': companyNameErrorMessage
    }),
  companyNumber: Joi.string()
    .required()
    .pattern(/\w+/)
    .messages({
      'any.required': companyNumberErrorMessage,
      'string.base': companyNumberErrorMessage,
      'string.empty': companyNumberErrorMessage,
      'string.pattern.base': companyNumberErrorMessage
    }),
  description: Joi.string()
    .required()
    .pattern(/\w+/)
    .messages({
      'any.required': descriptionErrorMessage,
      'string.base': descriptionErrorMessage,
      'string.empty': descriptionErrorMessage,
      'string.pattern.base': descriptionErrorMessage
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
      'date.format': invalidDateErrorMessage,
    })
});
