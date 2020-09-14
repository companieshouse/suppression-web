import axios from 'axios'
import { StatusCodes } from 'http-status-codes/build';
import { SuppressionData } from '../../../src/models/SuppressionDataModel';
import {
  SuppressionUnauthorisedError,
  SuppressionUnprocessableEntityError
} from '../../../src/services/Suppression/errors';
import { SuppressionService } from '../../../src/services/Suppression/SuppressionService';
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SuppressionService', () => {

  const mockApiKey: string = 'key';
  const mockGeneratedReference: string = '123123';
  const mockSuppressionsUri: string = '/suppressions';

  describe('saving suppression', () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error when suppression not defined', async() => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save(undefined as any, mockApiKey).catch((err) => {
        expect(err).toEqual(Error('Suppression data is missing'))
      })
    });

    it('should throw an error when API Key not defined', async () => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as SuppressionData, undefined as any).catch((err) => {
        expect(err).toEqual(Error('Key is missing'))
      });
    });

    it('should save appeal and return application reference', async() => {

      mockedAxios.post.mockResolvedValue({
        status: StatusCodes.CREATED,
        headers: {
          location: '/suppressions/123123'
        },
        data: mockGeneratedReference
      });

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as SuppressionData, mockApiKey).then((response: string) => {
        expect(response).toEqual(mockGeneratedReference)
      });

    });

    it('should return error when resource not created', async() => {

      mockedAxios.post.mockResolvedValue({
        status: StatusCodes.CONFLICT,
      });

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as SuppressionData, mockApiKey).catch((err) => {
        expect(err).toEqual(new Error('save suppression failed with message: Could not create suppression resource'));
      })

    });

    it('should return entity error when invalid suppression data', async() => {

      mockedAxios.post.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.UNPROCESSABLE_ENTITY }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as SuppressionData, mockApiKey).catch((err) => {
        expect(err).toEqual(new SuppressionUnprocessableEntityError('save suppression on invalid suppression data'));
      })
    });

    it('should return unauthorized error when invalid headers', async() => {

      mockedAxios.post.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.UNAUTHORIZED }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as SuppressionData, mockApiKey).catch((err) => {
        expect(err).toEqual(new SuppressionUnauthorisedError('save suppression unauthorised'));
      })
    });

  });
});
