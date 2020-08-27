import * as Joi from 'joi';

const invalidDateErrorMessage: string = 'Enter a real date';

export const dateSchema = Joi.object({
  date: Joi.date()
    .required()
    .iso()
    .messages({
      'any.required': invalidDateErrorMessage,
      'date.base': invalidDateErrorMessage,
      'date.format': invalidDateErrorMessage,
    })
});
