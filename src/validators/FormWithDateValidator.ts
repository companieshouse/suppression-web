import { Request } from 'express';
import { AnySchema } from 'joi';
import moment from 'moment';

import { ValidationError } from '../utils/validation/ValidationError';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { FormValidator } from './FormValidator';

export class FormWithDateValidator extends FormValidator {

  private readonly missingDateErrorMessage: string;

  constructor(schema: AnySchema, missingDateErrorMessage: string) {
    super(schema);
    this.missingDateErrorMessage = missingDateErrorMessage;
  }

  public async validate(request: Request): Promise<ValidationResult> {

    const dayField: string = 'day';
    const monthField: string = 'month';
    const yearField: string = 'year';
    const dateField: string = 'date';

    const yearValue = request.body[yearField];
    const monthValue = request.body[monthField];
    const dayValue = request.body[dayField];

    if (yearValue && monthValue && dayValue) {
      request.body.date = moment(`${yearValue}-${monthValue}-${dayValue}`, 'YYYY-MM-DD').toDate();
    }

    const validationResult: ValidationResult = await super.validate(request);

    if (validationResult.errors.length > 0) {
      const dateError: ValidationError | undefined = validationResult.getErrorForField(dateField);
      const dayError: ValidationError | undefined = validationResult.getErrorForField(dayField);
      const monthError: ValidationError | undefined = validationResult.getErrorForField(monthField);
      const yearError: ValidationError | undefined = validationResult.getErrorForField(yearField);

      if (dateError && dateError.text === this.missingDateErrorMessage) {
        if (dayError && monthError && yearError) {
          this.removeValidationError(validationResult, dayError);
          this.removeValidationError(validationResult, monthError);
          this.removeValidationError(validationResult, yearError);
        } else {
          this.removeValidationError(validationResult, dateError);
        }
      }

      validationResult.errors.forEach((error) => {
        if ([dayField, monthField, yearField].includes(error.field)) {
          error.setHref(dateField);
        }
      });
    }
    return validationResult;
  }

  private removeValidationError(validationResult: ValidationResult, validationError: ValidationError): void {
    validationResult.errors.splice(validationResult.errors.indexOf(validationError), 1);
  }
}
