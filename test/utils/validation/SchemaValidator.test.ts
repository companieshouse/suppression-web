import Joi from 'joi';

import { SchemaValidator } from '../../../src/utils/validation/SchemaValidator';
import { ValidationError } from '../../../src/utils/validation/ValidationError';

describe('SchemaValidator', () => {
  describe('instance creation', () => {
    [undefined, null].forEach(invalidValue => {
      it(`should throw Error when schema is '${invalidValue}'`, () => {
        expect(() => new SchemaValidator(invalidValue as any)).toThrow('Schema is required');
      });
    });
  });

  describe('validation', () => {
    const schema = Joi.object({
      city: Joi.string().required()
    });
    const validator = new SchemaValidator(schema);

    it('should return validation result without errors when validation succeeded', () => {
      const validationResult = validator.validate({ city: 'Cardiff' });
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should return validation result with errors when validation failed', () => {
      const validationResult = validator.validate({});
      expect(validationResult.errors).toEqual([new ValidationError('city', '"city" is required')]);
    });
  });
});
