import { YesNo } from '../../../src/models/YesNo';
import { SchemaValidator } from '../../../src/utils/validation/SchemaValidator';
import { ValidationError } from '../../../src/utils/validation/ValidationError';
import { schema } from '../../../src/validators/schema/ApplicantDetailsSchema';
import { assertValidationErrors } from '../ValidationAssertions';

const validator = new SchemaValidator(schema);

describe('Applicant Details schema', () => {

  describe('invalid values', () => {

    const fullNameErrorMessage = 'Full name is required';
    const hasPreviousNameMissingMessage = 'Select yes if the applicant has used a different name for business purposes in the last 20 years';
    const previousNameMissingMessage = 'Enter previous full names, used for business purposes';
    const emailMissingErrorMessage = 'Email address is required';
    const emailInvalidErrorMessage = 'Enter an email address in the correct format, like name@example.com';

    it('should reject empty object', () => {
      const validationResult = validator.validate({});
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('hasPreviousName', hasPreviousNameMissingMessage),
        new ValidationError('emailAddress', emailMissingErrorMessage)
      ]);
    });

    it('should reject undefined values', () => {
      const validationResult = validator.validate({
        fullName: undefined,
        hasPreviousName: undefined,
        emailAddress: undefined
      });
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('hasPreviousName', hasPreviousNameMissingMessage),
        new ValidationError('emailAddress', emailMissingErrorMessage)
      ]);
    });

    it('should reject null values', () => {
      const validationResult = validator.validate({
        fullName: null,
        hasPreviousName: YesNo.yes,
        previousName: null,
        emailAddress: null
      });
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('previousName', previousNameMissingMessage),
        new ValidationError('emailAddress', emailMissingErrorMessage)
      ]);
    });

    it('should reject empty values', () => {
      const validationResult = validator.validate({
        fullName: '',
        hasPreviousName: YesNo.yes,
        previousName: '',
        emailAddress: ''
      });
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('previousName', previousNameMissingMessage),
        new ValidationError('emailAddress', emailMissingErrorMessage)
      ]);
    });

    it('should reject blank values', () => {
      const validationResult = validator.validate({
        fullName: ' ',
        hasPreviousName: YesNo.yes,
        previousName: '',
        emailAddress: ' '
      });
      assertValidationErrors(validationResult, [
        new ValidationError('fullName', fullNameErrorMessage),
        new ValidationError('previousName', previousNameMissingMessage),
        new ValidationError('emailAddress', emailInvalidErrorMessage)
      ]);
    });

    it('should reject an invalid email address', () => {
      const validationResult = validator.validate({
        fullName: 'John Doe',
        hasPreviousName: YesNo.no,
        emailAddress: 'test.com'
      });
      assertValidationErrors(validationResult, [
        new ValidationError('emailAddress', emailInvalidErrorMessage)
      ]);
    });

    it('should reject previousName if undefined and yes is selected', () => {
      const validationResult = validator.validate({
        fullName: 'John Doe',
        hasPreviousName: YesNo.yes,
        previousName: undefined,
        emailAddress: 'test@gmail.com'
      });
      assertValidationErrors(validationResult, [
        new ValidationError('previousName', previousNameMissingMessage),
      ]);
    });

    it('should reject previousName if empty and yes is selected', () => {
      const validationResult = validator.validate({
        fullName: 'John Doe',
        hasPreviousName: YesNo.yes,
        emailAddress: 'test@gmail.com'
      });
      assertValidationErrors(validationResult, [
        new ValidationError('previousName', previousNameMissingMessage),
      ]);
    });
  });

  describe('valid values', () => {

    it('should allow non-empty value for Full Name, no previous name and valid entry for Email Address, with leading / trailing spaces', () => {
      const validationResult = validator.validate({
        fullName: 'John Doe',
        hasPreviousName: YesNo.no,
        emailAddress: 'test@example.com'
      });
      assertValidationErrors(validationResult, []);
    });

    it('should allow non-empty value for Full Name, with previous name and valid entry for Email Address, with leading / trailing spaces', () => {
      const validationResult = validator.validate({
        fullName: 'John Doe',
        hasPreviousName: YesNo.yes,
        previousName: 'John Poe',
        emailAddress: 'test@example.com'
      });
      assertValidationErrors(validationResult, []);
    });
  });
});
