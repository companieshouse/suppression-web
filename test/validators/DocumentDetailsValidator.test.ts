import { assertValidationErrors } from './ValidationAssertions';
import { DocumentDetailsValidator } from '../../src/validators/DocumentDetailsValidator';
import { ValidationResult } from '../../src/utils/validation/ValidationResult';
import { ValidationError } from '../../src/utils/validation/ValidationError';

const invalidMonthErrorMessage: string = 'You must enter a month';
const invalidYearErrorMessage: string = 'You must enter a year';
const missingDateErrorMessage: string = 'Document date is required';

describe('Document details validator', () => {

  it('should allow valid document details', async () => {

    const documentDetailsValidator: DocumentDetailsValidator = new DocumentDetailsValidator();

    const validationResult: ValidationResult = await documentDetailsValidator.validate(
      {
        body: {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '01',
        month: '01',
        year: '2020'
      }
    } as any);

    assertValidationErrors(validationResult, []);
  });

  it('should display missing date validation error when all date components are empty', async () => {

    const documentDetailsValidator: DocumentDetailsValidator = new DocumentDetailsValidator();

    const validationResult: ValidationResult = await documentDetailsValidator.validate(
      {
        body: {
          companyName: 'company-name-test',
          companyNumber: 'NI000000',
          description: 'This is a document'
        }
      } as any);

    assertValidationErrors(validationResult, [
      new ValidationError('date', missingDateErrorMessage)
    ]);
  });

  it('should display date component validation errors when one or more date components are empty', async () => {

    const documentDetailsValidator: DocumentDetailsValidator = new DocumentDetailsValidator();

    const validationResult: ValidationResult = await documentDetailsValidator.validate(
      {
        body: {
          companyName: 'company-name-test',
          companyNumber: 'NI000000',
          description: 'This is a document',
          day: '01'
        }
      } as any);

    assertValidationErrors(validationResult, [
      new ValidationError('month', invalidMonthErrorMessage),
      new ValidationError('year', invalidYearErrorMessage)
    ]);
  });
});
