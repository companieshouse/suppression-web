import { ValidationError } from '../../../src/validators/utils/ValidationError';
import { ValidationResult } from '../../../src/validators/utils/ValidationResult';

export const assertValidationErrors = (result: ValidationResult, expectedErrors: ValidationError[]): void => {
  expect(result.errors).toHaveLength(expectedErrors.length);
  expectedErrors.forEach(expectedError => {
    expect(result.getErrorForField(expectedError.field)?.text).toEqual(expectedError.text);
  });
};
