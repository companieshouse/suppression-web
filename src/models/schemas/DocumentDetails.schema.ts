import * as Joi from 'joi';

import { dateSchema } from './Date.schema';

const companyNameErrorMessage = 'Company name is required';
const companyNumberErrorMessage = 'Company number is required';
const documentDescriptionErrorMessage = 'Document description is required';
const invalidDayErrorMessage: string = 'You must enter a day';
const invalidMonthErrorMessage: string = 'You must enter a month';
const invalidYearErrorMessage: string = 'You must enter a year';

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
      'any.required': documentDescriptionErrorMessage,
      'string.base': documentDescriptionErrorMessage,
      'string.empty': documentDescriptionErrorMessage,
      'string.pattern.base': documentDescriptionErrorMessage
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
}).unknown(true)
  .when(Joi.object({
    day: Joi.exist(),
    month: Joi.exist(),
    year: Joi.exist()
  }).unknown(), {
    then: dateSchema
  });
