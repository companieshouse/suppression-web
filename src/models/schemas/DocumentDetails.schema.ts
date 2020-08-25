import * as Joi from 'joi';

const companyNameErrorMessage = 'Company name is required';
const companyNumberErrorMessage = 'Company number is required';
const documentDescriptionErrorMessage = 'Document description is required';

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
    })
});
