import axios from 'axios'
import { StatusCodes } from 'http-status-codes/build';
import { ApplicantDetails, SuppressionData } from '../../../src/models/SuppressionDataModel';
import {
  SuppressionUnauthorisedError,
  SuppressionUnprocessableEntityError
} from '../../../src/services/suppression/errors';
import { SuppressionService } from '../../../src/services/suppression/SuppressionService';
import { generateTestData } from '../../TestData';
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SuppressionService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAccessToken: string = 'token';
  const mockGeneratedReference: string = '123123';
  const mockSuppressionsUri: string = '/suppressions';

  describe('saving suppression', () => {

    it('should throw an error when suppression not defined', async() => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      for (const data of [undefined, null]) {
        await suppressionService.save(data as any, mockAccessToken).catch((err) => {
          expect(err).toEqual(Error('applicant details data is missing'))
        })
      }

    });

    it('should throw an error when Access token not defined', async () => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      for (const data of [undefined, null]) {
        await suppressionService.save({} as ApplicantDetails, data as any).catch((err) => {
          expect(err).toEqual(Error('Access token is missing'))
        });
      }
    });

    it('should save suppression and return application reference', async() => {

      mockedAxios.post.mockResolvedValue({
        status: StatusCodes.CREATED,
        headers: {
          location: '/suppressions/123123'
        },
        data: mockGeneratedReference
      });

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as ApplicantDetails, mockAccessToken).then((response: string) => {
        expect(response).toEqual(mockGeneratedReference)
      });

    });

    it('should return error when resource not created', async() => {

      mockedAxios.post.mockReturnValue(Promise.reject({
        status: StatusCodes.CONFLICT
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as ApplicantDetails, mockAccessToken).catch((err) => {
        expect(err).toEqual(new Error('save suppression failed with message: unknown error'));
      })

    });

    it('should return entity error when invalid suppression data', async() => {

      mockedAxios.post.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.UNPROCESSABLE_ENTITY }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as ApplicantDetails, mockAccessToken).catch((err) => {
        expect(err).toEqual(new SuppressionUnprocessableEntityError('save suppression on invalid suppression data'));
      })
    });

    it('should return unauthorized error when invalid headers', async() => {

      mockedAxios.post.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.UNAUTHORIZED }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save({} as ApplicantDetails, mockAccessToken).catch((err) => {
        expect(err).toEqual(new SuppressionUnauthorisedError('save suppression unauthorised'));
      })
    });

  });

  describe('get suppression', () => {

    it('should throw an error when application reference not defined', async() => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      for (const data of [undefined, null]) {
        await suppressionService.get(data as any, mockAccessToken).catch((err) => {
          expect(err).toEqual(Error('Application reference is missing'))
        })
      }
    });

    it('should throw an error when Access token not defined', async () => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      for (const data of [undefined, null]) {
        await suppressionService.get(mockGeneratedReference, data as any).catch((err) => {
          expect(err).toEqual(Error('Access token is missing'))
        });
      }
    });

    it('should retrieve full suppression', async() => {

      mockedAxios.get.mockReturnValue(Promise.resolve({
        status: StatusCodes.OK,
        data: generateTestData() as SuppressionData
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.get(mockGeneratedReference, mockAccessToken).then((response: SuppressionData) => {
        expect(response).toEqual(generateTestData())
      });

    });

    it('should retrieve partial suppression', async() => {

      mockedAxios.get.mockReturnValue(Promise.resolve({
        status: StatusCodes.OK,
        data: { applicantDetails: generateTestData().applicantDetails } as SuppressionData
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.get(mockGeneratedReference, mockAccessToken).then((response: SuppressionData) => {
        expect(response).toEqual({ applicantDetails: generateTestData().applicantDetails })
      });

    });

    it('should return error when resource not found', async() => {

      mockedAxios.get.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.NOT_FOUND }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.get(mockGeneratedReference, mockAccessToken).catch((err) => {
        expect(err).toEqual(new Error('get suppression failed. Suppression not found'));
      })

    });

    it('should return unauthorized error when invalid headers', async() => {

      mockedAxios.get.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.UNAUTHORIZED }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.get(mockGeneratedReference, mockAccessToken).catch((err) => {
        expect(err).toEqual(new SuppressionUnprocessableEntityError('get suppression unauthorised'));
      })
    });

  });

  describe('patching suppression', () => {

    const mockPartialData = { applicantDetails: generateTestData().applicantDetails };

    it('should throw an error when application reference not defined', async() => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      for (const data of [undefined, null]) {
        await suppressionService.patch(mockPartialData, data as any, mockAccessToken).catch((err) => {
          expect(err).toEqual(Error('Application reference is missing'))
        })
      }
    });

    it('should throw an error when Access token not defined', async () => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      for (const data of [undefined, null]) {
        await suppressionService.patch(mockPartialData, mockGeneratedReference, data as any).catch((err) => {
          expect(err).toEqual(Error('Access token is missing'))
        });
      }
    });

    it('should throw an error when partial data not defined', async () => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      for (const data of [undefined, null]) {
        await suppressionService.patch(data as any, mockGeneratedReference, mockAccessToken).catch((err) => {
          expect(err).toEqual(Error('Partial suppression data is missing'))
        });
      }
    });

    it('should return No Content when partial data saved', async() => {

      mockedAxios.patch.mockReturnValue(Promise.resolve({
        status: StatusCodes.NO_CONTENT,
        data: true
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.patch(mockPartialData, mockGeneratedReference, mockAccessToken);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${mockSuppressionsUri}/suppressions/${mockGeneratedReference}`,
        mockPartialData as SuppressionData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + mockAccessToken
          }
        })

    });

    it('should return error when resource not found', async() => {

      mockedAxios.patch.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.NOT_FOUND }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.patch(mockPartialData, mockGeneratedReference, mockAccessToken).catch((err) => {
        expect(err).toEqual(new Error('patch suppression failed. Suppression not found'));
      })

    });

    it('should return entity error when invalid suppression data', async() => {

      mockedAxios.patch.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.UNPROCESSABLE_ENTITY }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.patch(mockPartialData, mockGeneratedReference, mockAccessToken).catch((err) => {
        expect(err).toEqual(new SuppressionUnprocessableEntityError('patch suppression on invalid suppression data'));
      })
    });

    it('should return unauthorized error when invalid headers', async() => {

      mockedAxios.patch.mockReturnValue(Promise.reject({
        response: { status: StatusCodes.UNAUTHORIZED }
      }));

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.patch(mockPartialData, mockGeneratedReference, mockAccessToken).catch((err) => {
        expect(err).toEqual(new SuppressionUnprocessableEntityError('patch suppression unauthorised'));
      })
    });

  });
});
