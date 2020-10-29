import * as Joi from 'joi';

import { basicString } from './BasicStringSchemaItem';

const companyNameErrorMessage: string = 'Enter the company name';
const companyNumberErrorMessage: string = 'Enter the company number';
const descriptionErrorMessage: string = 'Enter the document name and description';

const invalidDayErrorMessage: string = 'You must enter a day';
const invalidMonthErrorMessage: string = 'You must enter a month';
const invalidYearErrorMessage: string = 'You must enter a year';

const missingDateErrorMessage: string = 'Enter the date the document was added to the register';
const invalidDateErrorMessage: string = 'Enter a real date';

const dayMonthRegex: RegExp = /^[0-9]{1,2}$/;
const yearRegex: RegExp = /^[0-9]{4}$/;

export const schema = Joi.object({
  companyName: basicString(companyNameErrorMessage),
  companyNumber: basicString(companyNumberErrorMessage),
  description: basicString(descriptionErrorMessage),
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
