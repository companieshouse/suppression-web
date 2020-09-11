import axios, { AxiosResponse } from 'axios'
import { SuppressionData } from '../../../src/models/SuppressionDataModel';
import { SuppressionService } from '../../../src/services/Suppression/SuppressionService';

jest.mock('axios', () => {
  return jest.fn().mockImplementation(() => {
    return {
      post: () => {
        return {applicationReference: '123123'}
      }
    }
  })
});

describe('SuppressionService', () => {

  const mockApiKey: string = 'key';

  const mockSuppressionsUri: string = '/suppressions';

  const suppression: SuppressionData = {
    applicationReference: '',
    applicantDetails: {
      fullName: 'Andy',
      emailAddress: 'andy@gmail.com'
    },
    addressToRemove: {
      line1: 'Handy Street',
      line2: '',
      town: 'Cardiff',
      county: 'Greater Cardiff',
      postcode: 'CC123'
    },
    documentDetails: {
      companyName: 'A Company',
      companyNumber: 'NI123123',
      description: 'a document',
      date: '10/12/2010'
    }
  };

  describe('saving suppression', () => {

    it('should throw an error when suppression not defined', () => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      [undefined, null].forEach(async suppressionData => {
        try {
          await suppressionService.save(suppressionData as any, mockApiKey);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect(err).toHaveProperty('message');
          expect(err).toContain('Suppression data is missing');
        }
      });
    });

    it('should throw an error when API Key not defined', () => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      [undefined, null].forEach(async invalidApiKey => {
        try {
          await suppressionService.save(suppression, invalidApiKey as any);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect(err).toHaveProperty('message');
          expect(err).toContain('API Key is missing');
        }
      });
    });

    it('should save appeal and return location header', async() => {

      const mockGeneratedReference: string = '123123';

      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save(suppression, mockApiKey)
        .then((response: string) => {
          expect(response).toEqual({applicationReference: mockGeneratedReference})
        });

    });

  });
});
