import axios, { AxiosError } from 'axios'
import { StatusCodes } from 'http-status-codes/build';
import { SuppressionData } from '../../../src/models/SuppressionDataModel';
import { SuppressionUnprocessableEntityError } from '../../../src/services/Suppression/errors';
import { SuppressionService } from '../../../src/services/Suppression/SuppressionService';
import exp = require('constants');
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

    afterAll(() => {
      jest.resetAllMocks();
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
          location: true
        },
        data: mockGeneratedReference
      });

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as SuppressionData, mockApiKey).then((response: string) => {
        expect(response).toEqual(mockGeneratedReference)
      });

    });

    it('should return status 422 when invalid suppression data', async() => {

      mockedAxios.post.mockRejectedValue(StatusCodes.UNPROCESSABLE_ENTITY);

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as SuppressionData, mockApiKey).catch((err) => {
        expect(err).toEqual(SuppressionUnprocessableEntityError);
      })

    });

  });
});
