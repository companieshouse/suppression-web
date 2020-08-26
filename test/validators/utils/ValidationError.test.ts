import { ValidationError } from '../../../src/validators/utils/ValidationError';

describe('ValidationError', () => {
  describe('instantiation', () => {
    [undefined, null, ''].forEach(invalidValue => {
      it(`should throw Error when field name is '${invalidValue}'`, () => {
        expect(() => new ValidationError(invalidValue as any, 'Unexpected error')).toThrow('Field name is required');
      });
    });

    [undefined, null, ''].forEach(invalidValue => {
      it(`should throw Error when error message is '${invalidValue}'`, () => {
        expect(() => new ValidationError('field', invalidValue as any)).toThrow('Error message is required');
      });
    });
  });

  describe('link building', () => {
    it('should prepend field name with "#" and append "-error" to field name', () => {
      expect(new ValidationError('field', 'Unexpected error').href).toEqual('#field-error');
    });

    it('should hyphenise field name when it is camel cased', () => {
      expect(new ValidationError('longerField', 'Unexpected error').href).toEqual('#longer-field-error');
      expect(new ValidationError('evenLongerField', 'Unexpected error').href).toEqual('#even-longer-field-error');
      expect(new ValidationError('TheLongestField', 'Unexpected error').href).toEqual('#the-longest-field-error');
    });

    it('should not hyphenise field name when it is already hyphenised', () => {
      expect(new ValidationError('longer-field', 'Unexpected error').href).toEqual('#longer-field-error');
    });
  });
});
