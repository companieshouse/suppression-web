import { SchemaValidator } from '../../../src/utils/validation/SchemaValidator';
import { ValidationError } from '../../../src/utils/validation/ValidationError';
import { assertValidationErrors } from '../ValidationAssertions';
import { schema } from '../../../src/validators/schema/DocumentDetailsSchema';

const validator = new SchemaValidator(schema);

describe('Document Details schema', () => {

  describe('invalid values', () => {

    const companyNameErrorMessage: string = 'Company name is required';
    const companyNumberErrorMessage: string = 'Company number is required';
    const descriptionErrorMessage: string = 'Document description is required';

    const invalidDayErrorMessage: string = 'You must enter a day';
    const invalidMonthErrorMessage: string = 'You must enter a month';
    const invalidYearErrorMessage: string = 'You must enter a year';

    const missingDateErrorMessage: string = 'Document date is required';
    const invalidDateErrorMessage: string = 'Enter a real date';

    it('should reject empty object', () => {
      const validationResult = validator.validate({});
      assertValidationErrors(validationResult, [
        new ValidationError('companyName', companyNameErrorMessage),
        new ValidationError('companyNumber', companyNumberErrorMessage),
        new ValidationError('description', descriptionErrorMessage),
        new ValidationError('day', invalidDayErrorMessage),
        new ValidationError('month', invalidMonthErrorMessage),
        new ValidationError('year', invalidYearErrorMessage),
        new ValidationError('date', missingDateErrorMessage)
      ]);
    });

    it('should reject undefined values', () => {
      const validationResult = validator.validate({
        companyName: undefined,
        companyNumber: undefined,
        description: undefined,
        day: undefined,
        month: undefined,
        year: undefined,
        date: undefined
      });
      assertValidationErrors(validationResult, [
        new ValidationError('companyName', companyNameErrorMessage),
        new ValidationError('companyNumber', companyNumberErrorMessage),
        new ValidationError('description', descriptionErrorMessage),
        new ValidationError('day', invalidDayErrorMessage),
        new ValidationError('month', invalidMonthErrorMessage),
        new ValidationError('year', invalidYearErrorMessage),
        new ValidationError('date', missingDateErrorMessage)
      ]);
    });

    it('should reject null values', () => {
      const validationResult = validator.validate({
        companyName: null,
        companyNumber: null,
        description: null,
        day: null,
        month: null,
        year: null,
        date: null
      });
      assertValidationErrors(validationResult, [
        new ValidationError('companyName', companyNameErrorMessage),
        new ValidationError('companyNumber', companyNumberErrorMessage),
        new ValidationError('description', descriptionErrorMessage),
        new ValidationError('day', invalidDayErrorMessage),
        new ValidationError('month', invalidMonthErrorMessage),
        new ValidationError('year', invalidYearErrorMessage),
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject empty values', () => {
      const validationResult = validator.validate({
        companyName: '',
        companyNumber: '',
        description: '',
        day: '',
        month: '',
        year: '',
        date: new Date('')
      });
      assertValidationErrors(validationResult, [
        new ValidationError('companyName', companyNameErrorMessage),
        new ValidationError('companyNumber', companyNumberErrorMessage),
        new ValidationError('description', descriptionErrorMessage),
        new ValidationError('day', invalidDayErrorMessage),
        new ValidationError('month', invalidMonthErrorMessage),
        new ValidationError('year', invalidYearErrorMessage),
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject blank values', () => {
      const validationResult = validator.validate({
        companyName: ' ',
        companyNumber: ' ',
        description: ' ',
        day: ' ',
        month: ' ',
        year: ' ',
        date: new Date(' ')
      });
      assertValidationErrors(validationResult, [
        new ValidationError('companyName', companyNameErrorMessage),
        new ValidationError('companyNumber', companyNumberErrorMessage),
        new ValidationError('description', descriptionErrorMessage),
        new ValidationError('day', invalidDayErrorMessage),
        new ValidationError('month', invalidMonthErrorMessage),
        new ValidationError('year', invalidYearErrorMessage),
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject invalid date patterns', () => {
      const validationResult = validator.validate({
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '001',
        month: 'abc',
        year: '*@&',
        date: '0'
      });
      assertValidationErrors(validationResult, [
        new ValidationError('day', invalidDayErrorMessage),
        new ValidationError('month', invalidMonthErrorMessage),
        new ValidationError('year', invalidYearErrorMessage),
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject invalid (non-existing) date', () => {
      const validationResult = validator.validate({
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '33',
        month: '01',
        year: '2020',
        date: new Date('2020-01-33')
      });
      assertValidationErrors(validationResult, [
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });
  });

  describe('valid values', () => {

    it('should allow valid document details', () => {
      const validationResult = validator.validate({
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '01',
        month: '01',
        year: '2020',
        date: new Date('2020-01-01')
      });
      assertValidationErrors(validationResult, []);
    });
  });
});
