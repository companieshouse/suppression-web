import moment from 'moment';

import { YesNo } from '../../../src/models/YesNo';
import { SchemaValidator } from '../../../src/utils/validation/SchemaValidator';
import { ValidationError } from '../../../src/utils/validation/ValidationError';
import { schema } from '../../../src/validators/schema/ApplicantDetailsSchema';
import { assertValidationErrors } from '../ValidationAssertions';

const validator = new SchemaValidator(schema);

describe('Applicant Details schema', () => {

  function generateValidTestData(): any {
    return {
      fullName: 'John Doe',
      hasPreviousName: YesNo.yes,
      previousName: 'John Poe',
      day: '1',
      month: '1',
      year: '2020',
      date: moment('2020-1-1', 'YYYY-MM-DD').toDate()
    };
  }

  describe('invalid values', () => {

    const fullNameErrorMessage = 'Enter the applicant’s full name';
    const hasPreviousNameMissingMessage = 'Select yes if the applicant has used a different name on the Companies house register in the last 20 years';
    const previousNameMissingMessage = 'Enter previous full name';

    const invalidDayErrorMessage = 'You must enter a day';
    const invalidMonthErrorMessage = 'You must enter a month';
    const invalidYearErrorMessage = 'You must enter a year';

    const missingDateErrorMessage = 'Enter the applicant’s date of birth';
    const invalidDateErrorMessage = 'Enter a real date';

    const expectedValidationErrors = [
      new ValidationError('fullName', fullNameErrorMessage),
      new ValidationError('hasPreviousName', hasPreviousNameMissingMessage),
      new ValidationError('day', invalidDayErrorMessage),
      new ValidationError('month', invalidMonthErrorMessage),
      new ValidationError('year', invalidYearErrorMessage)
    ];

    function generateInvalidTestData(value: any): any {
      return {
        fullName: value,
        hasPreviousName: value,
        day: value,
        month: value,
        year: value,
        date: value
      };
    }

    it('should reject empty object', () => {
      const validationResult = validator.validate({});
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', missingDateErrorMessage)));
    });

    it('should reject undefined values', () => {
      const testData = generateInvalidTestData(undefined);
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', missingDateErrorMessage)));
    });

    it('should reject null values', () => {
      const testData = generateInvalidTestData(null);
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', invalidDateErrorMessage)));
    });

    it('should reject empty values', () => {
      const testData = generateInvalidTestData('');
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', invalidDateErrorMessage)));
    });

    it('should reject blank values', () => {
      const testData = generateInvalidTestData(' ');
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, expectedValidationErrors
        .concat(new ValidationError('date', invalidDateErrorMessage)));
    });

    it('should reject previousName if undefined and yes is selected', () => {
      const testData = generateValidTestData();
      testData.previousName = undefined;

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, [
        new ValidationError('previousName', previousNameMissingMessage),
      ]);
    });

    it('should reject previousName if empty and yes is selected', () => {
      const testData = generateValidTestData();
      delete testData.previousName;

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, [
        new ValidationError('previousName', previousNameMissingMessage),
      ]);
    });

    it('should reject invalid date patterns', () => {
      const testData = generateValidTestData();
      testData.day = '001';
      testData.month = 'abc';
      testData.year = '*@&';
      testData.date = '0';

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, [
        new ValidationError('day', invalidDayErrorMessage),
        new ValidationError('month', invalidMonthErrorMessage),
        new ValidationError('year', invalidYearErrorMessage),
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject invalid (non-existing) date', () => {
      const testData = generateValidTestData();
      testData.day = '33';
      testData.date = moment('2020-1-33', 'YYYY-MM-DD').toDate();

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, [
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject invalid calendar dates - feb 30th does not exist', () => {
      const testData = generateValidTestData();
      testData.day = '30';
      testData.month = '2';
      testData.date = moment('2020-2-30', 'YYYY-MM-DD').toDate();

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, [
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject invalid calendar dates - april 31st does not exist', () => {
      const testData = generateValidTestData();
      testData.day = '31';
      testData.month = '4';
      testData.date = moment('2020-4-31', 'YYYY-MM-DD').toDate();

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, [
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

    it('should reject 29th of feb during a non-leap year', () => {
      const testData = generateValidTestData();
      testData.day = '29';
      testData.month = '2';
      testData.year = '1997';
      testData.date = moment('1997-2-29', 'YYYY-MM-DD').toDate();

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, [
        new ValidationError('date', invalidDateErrorMessage)
      ]);
    });

  });

  describe('valid values', () => {

    it('should allow non-empty value for Full Name and valid values for Date of Birth, without a previous name ', () => {
      const testData = generateValidTestData();
      testData.hasPreviousName = YesNo.no;
      delete testData.previousName;

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, []);
    });

    it('should allow non-empty value for Full Name and valid values for Date of Birth, with a previous name', () => {
      const testData = generateValidTestData();
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, []);
    });

    it('should allow 29th of feb during a leap year', () => {
      const testData = generateValidTestData()
      testData.day = '29';
      testData.month = '2';

      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, []);
    });
  });
});
