import * as fs from 'fs';
import * as Joi from 'joi';

import {
  getConfigValue,
  getConfigValueOrDefault,
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

    it('should load and parse environment variables from custom file', () => {

      const testEnvFilePath = 'test/modules/config-handler/.testenv';

      loadEnvironmentVariables({customFilePath: testEnvFilePath});

      expect(process.env).toEqual(expect.objectContaining({VAR_1: '123', VAR_2: 'abc', VAR_3: ''}));
    });

    it('should ignore file that does not exist and default to runtime environment variables', () => {
      process.env.VAR_1 = '123';

      const testEnvFilePath = 'invalid';

      loadEnvironmentVariables({customFilePath: testEnvFilePath});

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
      });

      withTemporaryProfileFile(process.env.NODE_ENV!, '', () => {
        try {
          loadEnvironmentVariables({validationSchema: testValidationSchema});
        } catch (err) {
          expect(err).toEqual(new Error('Config validation error: ValidationError: "ENABLED" is required'));
        }
      });
    });

  });
  describe('retrieve config', () => {

    const testVariable = 'VAR_1'
    const testValue = '123'

    describe('get config value', () => {

      it('should return config value for valid key', () => {
        process.env[testVariable] = testValue;

        const value = getConfigValue(testVariable);

        expect(value).toEqual(testValue);
      });

      it('should throw exception for invalid key', () => {

        try {
          getConfigValue(testVariable);
        } catch (err) {
          expect(err).toEqual(new Error('Variable VAR_1 was not found'));
        }
      });
    });

    describe('get config value or default', () => {

      it('should return config value for valid key', () => {
        process.env[testVariable] = testValue;

        const value = getConfigValueOrDefault(testVariable, 'default');

        expect(value).toEqual(testValue);
      });

      it('should return default value for invalid key', () => {

        const value = getConfigValueOrDefault(testVariable, 'default');

        expect(value).toEqual('default');
      });

    });
  });
});
