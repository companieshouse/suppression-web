import { ValidationError } from '../../src/utils/validation/ValidationError';
import { ValidationResult } from '../../src/utils/validation/ValidationResult';
import { FormWithDateValidator } from '../../src/validators/FormWithDateValidator';
import { schema } from '../../src/validators/schema/DocumentDetailsSchema';
import { assertValidationErrors } from './ValidationAssertions';

const invalidMonthErrorMessage: string = 'You must enter a month';
const invalidYearErrorMessage: string = 'You must enter a year';
const missingDateErrorMessage: string = 'Enter the date the document was added to the register';

describe('FormWithDate validator', () => {

  const documentDetailsValidator = new FormWithDateValidator(
    schema, 'Enter the date the document was added to the register'
  );

  it('should allow a form with a valid date', async () => {

    const validationResult: ValidationResult = await documentDetailsValidator.validate({
      body: {
        companyName: 'irrelevant',
        companyNumber: 'irrelevant',
        description: 'irrelevant',
        day: '01',
        month: '01',
        year: '2020'
      }
    } as any);

    assertValidationErrors(validationResult, []);
  });

  it('should display missing date validation error when all date components are empty', async () => {

    const validationResult: ValidationResult = await documentDetailsValidator.validate(
      {
        body: {
          companyName: 'irrelevant',
          companyNumber: 'irrelevant',
          description: 'irrelevant'
        }
      } as any);

    assertValidationErrors(validationResult, [
      new ValidationError('date', missingDateErrorMessage)
    ]);
  });

  it('should display date component validation errors when one or more date components are empty', async () => {

    const validationResult: ValidationResult = await documentDetailsValidator.validate(
      {
        body: {
          companyName: 'irrelevant',
          companyNumber: 'irrelevant',
          description: 'irrelevant',
          day: '01'
        }
      } as any);

    assertValidationErrors(validationResult, [
      new ValidationError('month', invalidMonthErrorMessage),
      new ValidationError('year', invalidYearErrorMessage)
    ]);
  });
});
