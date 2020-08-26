import { ValidationError } from '../../../src/utils/validation/ValidationError';
import { ValidationResult } from '../../../src/utils/validation/ValidationResult';

const error = new ValidationError('field', 'Unexpected error');

describe('ValidationResult', () => {
  describe('instantiation', () => {
    it('should instantiate with empty array of errors by default', () => {
      expect(new ValidationResult().errors).toHaveLength(0)
    });

    it('should allow instantiating with provided array of errors', () => {
      expect(new ValidationResult([error]).errors).toEqual([error]);
    });
  });

  describe('retrieving error for specific field', () => {
    it('should return undefined when error for given field does not exist', () => {
      expect(new ValidationResult([]).getErrorForField('field')).toBeUndefined()
    });

    it('should return matching error when error for given field does exist', () => {
      expect(new ValidationResult([error]).getErrorForField('field')).toEqual(error);
    });
  });
});
