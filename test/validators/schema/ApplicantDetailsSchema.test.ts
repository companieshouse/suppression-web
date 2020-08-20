import { SchemaValidator } from '../../../src/utils/validation/SchemaValidator';
import { ValidationError } from '../../../src/utils/validation/ValidationError';
import { schema } from '../../../src/validators/schema/ApplicantDetailsSchema';
import { assertValidationErrors } from '../ValidationAssertions';

const validator = new SchemaValidator(schema);

describe('Applicant Details schema', () => {

  describe('invalid values', () => {

    const fullNameErrorMessage = 'Full name is required';
    const emailMissingErrorMessage = 'Email address is required';
    const emailInvalidErrorMessage = 'Enter an email address in the correct format, like name@example.com';

    it('should reject empty object', () => {
      const validationResult = validator.validate({});
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('emailAddress', emailMissingErrorMessage)
      ]);
    });

    it('should reject undefined values', () => {
      const validationResult = validator.validate({
        fullName: undefined,
        emailAddress: undefined
      });
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('emailAddress', emailMissingErrorMessage)
      ]);
    });

    it('should reject null values', () => {
      const validationResult = validator.validate({
        fullName: null,
        emailAddress: null
      });
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('emailAddress', emailMissingErrorMessage)
      ]);
    });

    it('should reject empty values', () => {
      const validationResult = validator.validate({
        fullName: '',
        emailAddress: ''
      });
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('emailAddress', emailMissingErrorMessage)
      ]);
    });

    it('should reject blank values', () => {
      const validationResult = validator.validate({
        fullName: ' ',
        emailAddress: ' '
      });
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('emailAddress', emailInvalidErrorMessage)
      ]);
    });

    it('should reject an invalid email address', () => {
      const validationResult = validator.validate({
        fullName: 'John Doe',
        emailAddress: 'test.com'
      });
      assertValidationErrors(validationResult, [
        new ValidationError('emailAddress', emailInvalidErrorMessage)
      ]);
    });
  });

  describe('valid values', () => {

    it('should allow non-empty value for Full Name and valid entry for Email Address, with leading / trailing spaces', () => {
      const validationResult = validator.validate({
        fullName: 'John Doe',
        emailAddress: 'test@example.com'
      });
      assertValidationErrors(validationResult, []);
    });
  });
});

