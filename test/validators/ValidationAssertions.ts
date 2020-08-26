import { ValidationError } from '../../src/utils/validation/ValidationError';
import { ValidationResult } from '../../src/utils/validation/ValidationResult';

export const assertValidationErrors = (result: ValidationResult, expectedErrors: ValidationError[]): void => {
  expect(result.errors).toHaveLength(expectedErrors.length);
  expectedErrors.forEach(expectedError => {
    expect(result.getErrorForField(expectedError.field)?.text).toEqual(expectedError.text);
  });
};
