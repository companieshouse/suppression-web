import moment = require('moment');

import { SchemaValidator } from '../../../src/utils/validation/SchemaValidator';
import { ValidationError } from '../../../src/utils/validation/ValidationError';
import { schema } from '../../../src/validators/schema/DocumentDetailsSchema';
import { assertValidationErrors } from '../ValidationAssertions';

const validator = new SchemaValidator(schema);

describe('Document Details schema', () => {

  describe('invalid values', () => {

    const companyNameErrorMessage: string = 'Enter the company name';
    const companyNumberErrorMessage: string = 'Enter the company number';
    const descriptionErrorMessage: string = 'Enter the document name and description';

    const invalidDayErrorMessage: string = 'You must enter a day';
    const invalidMonthErrorMessage: string = 'You must enter a month';
    const invalidYearErrorMessage: string = 'You must enter a year';

    const missingDateErrorMessage: string = 'Enter the date the document was added to the register';
    const invalidDateErrorMessage: string = 'Enter a real date';

    const expectedValidationErrors = [
      new ValidationError('companyName', companyNameErrorMessage),
      new ValidationError('companyNumber', companyNumberErrorMessage),
      new ValidationError('description', descriptionErrorMessage),
      new ValidationError('day', invalidDayErrorMessage),
      new ValidationError('month', invalidMonthErrorMessage),
      new ValidationError('year', invalidYearErrorMessage)
    ];

    it('should reject empty object', () => {
      const validationResult = validator.validate({});
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', missingDateErrorMessage)));
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
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', missingDateErrorMessage)));
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
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', invalidDateErrorMessage)));
    });

    it('should reject empty values', () => {
      const validationResult = validator.validate({
        companyName: '',
        companyNumber: '',
        description: '',
        day: '',
        month: '',
        year: '',
        date: moment('', 'YYYY-MM-DD').toDate()
      });
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', invalidDateErrorMessage)));
    });

    it('should reject blank values', () => {
      const validationResult = validator.validate({
        companyName: ' ',
        companyNumber: ' ',
        description: ' ',
        day: ' ',
        month: ' ',
        year: ' ',
        date: moment(' ', 'YYYY-MM-DD').toDate()
      });
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', invalidDateErrorMessage)));
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
        date: moment('2020-01-33', 'YYYY-MM-DD').toDate()
      });
      assertValidationErrors(validationResult, [
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject invalid calendar dates - feb 30th does not exist', () => {
      const validationResult = validator.validate({
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '30',
        month: '02',
        year: '2015',
        date: moment('2015-02-30', 'YYYY-MM-DD').toDate()
      });
      assertValidationErrors(validationResult, [
        new ValidationError('date', 'Enter a real date')
      ]);
    });

    it('should reject invalid calendar dates - april 31st does not exist', () => {
      const validationResult = validator.validate({
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '31',
        month: '04',
        year: '2015',
        date: moment('2015-04-31', 'YYYY-MM-DD').toDate()
      });
      assertValidationErrors(validationResult, [
        new ValidationError('date', 'Enter a real date')
      ]);
    });

    it('should reject 29th of feb during a non-leap year', () => {
      const validationResult = validator.validate({
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '29',
        month: '02',
        year: '1997',
        date: moment('1997-02-29', 'YYYY-MM-DD').toDate()
      });
      assertValidationErrors(validationResult, [
        new ValidationError('date', 'Enter a real date')
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
        date: moment('2020-01-01', 'YYYY-MM-DD').toDate()
      });
      assertValidationErrors(validationResult, []);
    });

    it('should allow 29th of feb during a leap year', () => {
      const validationResult = validator.validate({
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '29',
        month: '02',
        year: '1996',
        date: moment('1996-02-29', 'YYYY-MM-DD').toDate()
      });
      assertValidationErrors(validationResult, []);
    });
  });
});
