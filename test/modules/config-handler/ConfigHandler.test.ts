import * as fs from 'fs';
import * as Joi from 'joi';

import {
  getConfigValue,
  loadEnvironmentVariables
} from '../../../src/modules/config-handler/ConfigHandler';

const originalEnvironmentVariables = process.env;

beforeEach(() => {
  jest.resetModules()
  process.env = {...originalEnvironmentVariables};
});

afterAll(() => {
  process.env = originalEnvironmentVariables;
});

describe('ConfigHandler', () => {

  function withTemporaryProfileFile(profile: string, content: string, fn: () => void): void {
    const path = `${__dirname}/../../../.env.${profile}`;

    fs.writeFileSync(path, content);
    try {
      fn();
      fs.unlinkSync(path);
    } catch (error) {
      fs.unlinkSync(path);
      throw error;
    }
  }

  describe('load and merge config', () => {

    it('should load and parse environment variables from existing env file', () => {
      process.env.NODE_ENV = 'fake';

      withTemporaryProfileFile(process.env.NODE_ENV!, 'ENABLED=1', () => {
        loadEnvironmentVariables();
        expect(process.env.ENABLED).toBe('1');
      });
    });

    it('should ignore file that does not exist and default to runtime environment variables', () => {
      process.env.VAR_1 = '123';

      loadEnvironmentVariables();

      expect(process.env.VAR_1).toBe('123');
    });

    it('should favour runtime environment variable when a duplicate variable exists in env file', () => {
      process.env.NODE_ENV = 'fake';
      process.env.ENABLED = '0';

      withTemporaryProfileFile(process.env.NODE_ENV!, 'ENABLED=1', () => {
        loadEnvironmentVariables();
        expect(process.env.ENABLED).toBe('0');
      });
    });

    it('should throw exception when required variable defined in validation schema is missing', () => {
      process.env.NODE_ENV = 'fake';

      const testValidationSchema = Joi.object({
        ENABLED: Joi.string().required()
      }).options({allowUnknown: true});

      withTemporaryProfileFile(process.env.NODE_ENV!, '', () => {
        try {
          loadEnvironmentVariables({validationSchema: testValidationSchema});
        } catch (err) {
          expect(err).toEqual(new Error('Config validation error: ValidationError: "ENABLED" is required'));
        }
      });
    });

    it('should accept default value when variable defined in validation schema is missing', () => {
      process.env.NODE_ENV = 'fake';

      const testValidationSchema = Joi.object({
        ENABLED: Joi.string().default('1')
      }).options({allowUnknown: true});

      withTemporaryProfileFile(process.env.NODE_ENV!, '', () => {
        loadEnvironmentVariables({validationSchema: testValidationSchema});
        expect(process.env.ENABLED).toBe('1');
      });
    });

  });

  describe('get config value', () => {
    const testVariable = 'VAR_1'
    const testValue = '123'

    it('should return config value for valid key', () => {
      process.env[testVariable] = testValue;

      const value = getConfigValue(testVariable);

      expect(value).toEqual(testValue);
    });

    it('should undefined for invalid key', () => {

      const value = getConfigValue(testVariable);

      expect(value).toBeUndefined();
    });
  });
});
