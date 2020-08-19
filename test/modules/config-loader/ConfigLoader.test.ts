import * as Joi from 'joi';

import { loadEnvironmentVariables, get, getOrDefault } from '../../../src/modules/config-loader/ConfigLoader';

describe('ConfigLoader', () => {
  let nodeEnv: string | undefined;

  beforeAll(() => {
    nodeEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = nodeEnv;
  });

  describe('load config', () => {

    const testEnvFilePath = 'test/modules/config-loader/.testenv';

    it('should load config for valid custom path', () => {

      process.env.NODE_ENV = 'testenv';

      loadEnvironmentVariables({filePath: testEnvFilePath});

      expect(process.env).toEqual(expect.objectContaining({TEST_PROP1: '123', TEST_PROP2: 'abc', TEST_PROP3: ''}));
    });

    it('should throw error when missing required config', () => {

      const testValidationSchema = Joi.object({
        PROPERTY_5: Joi.string()
          .required()
      });

      process.env.NODE_ENV = 'testenv';

      try {
        loadEnvironmentVariables({filePath: testEnvFilePath, validationSchema: testValidationSchema});
      } catch (err) {
        expect(err).toEqual(new Error('Config validation error: ValidationError: "PROPERTY_5" is required'));
      }
    });
  });

  describe('retrieve config', () => {

    const testProperty = 'PROPERTY_1'
    const testValue = '123'

    afterEach(() => {
      delete process.env[testProperty]
    });

    describe('get', () => {

      it('should return property value if set', () => {
        process.env[testProperty] = testValue;

        const value = get(testProperty);

        expect(value).toEqual(testValue);
      });

      it('should return undefined if not set', () => {

        for (const invalidProperty of [undefined, null, ' ', 'INVALID']) {
          const value = get(invalidProperty as any);
          expect(value).toBeUndefined();
        }
      });
    });

    describe('getOrDefault', () => {

      it('should return property value if set', () => {
        process.env[testProperty] = testValue;

        const value = getOrDefault(testProperty, 'default');

        expect(value).toEqual(testValue);
      });

      it('should return undefined if not set', () => {

        for (const invalidProperty of [undefined, null, ' ', 'INVALID']) {
          const value = getOrDefault(invalidProperty as any, 'default');
          expect(value).toEqual('default');
        }
      });
    });
  });
});
