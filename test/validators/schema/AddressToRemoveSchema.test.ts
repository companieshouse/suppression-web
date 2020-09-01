import { Address } from '../../../src/models/SuppressionDataModel'
import { SchemaValidator } from '../../../src/utils/validation/SchemaValidator';
import { ValidationError } from '../../../src/utils/validation/ValidationError';
import { schema } from '../../../src/validators/schema/AddressToRemoveSchema';
import { assertValidationErrors } from '../ValidationAssertions';

const validator = new SchemaValidator(schema);

describe('Applicant Details schema', () => {

  describe('invalid values', () => {

    const expectedErrors = [
      new ValidationError('line1', 'Building and street is required'),
      new ValidationError('town', 'Town or city is required'),
      new ValidationError('county', 'County is required'),
      new ValidationError('postcode', 'Postcode is required'),
    ];

    function generateTestData(value: any): Address {
      return {
        line1: value,
        line2: value,
        town: value,
        county: value,
        postcode: value
      };
    }

    it('should reject empty object', () => {
      const validationResult = validator.validate({});
      assertValidationErrors(validationResult, expectedErrors);
    });

    it('should reject undefined values', () => {
      const testData = generateTestData(undefined);
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, expectedErrors);
    });

    it('should reject null values', () => {
      const testData = generateTestData(null);
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, expectedErrors);
    });

    it('should reject empty values', () => {
      const testData = generateTestData('');
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, expectedErrors);
    });

    it('should reject blank values', () => {
      const testData = generateTestData(' ');
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, expectedErrors);
    });
  });

  describe('valid values', () => {

    function generateTestData(): Address {
      return {
        line1: '1 Main Street',
        line2: 'Selly Oak',
        town: 'Cardiff',
        county: 'Cardiff',
        postcode: 'CF14 3UZ'
      }
    }

    it('should allow non-empty values for all fields', () => {
      const validationResult = validator.validate(generateTestData());
      assertValidationErrors(validationResult, []);
    });

    it('should allow empty value for Address Line 2', () => {
      const testData = generateTestData();
      testData.line2 = '';
      const validationResult = validator.validate(testData);
      assertValidationErrors(validationResult, []);
    });
  });
});
