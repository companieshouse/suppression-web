import axios from 'axios'
import { SuppressionData } from '../../../src/models/SuppressionDataModel';
import { SuppressionService } from '../../../src/services/Suppression/SuppressionService';

jest.mock('axios');

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

    it('should throw an error when suppression not defined', async() => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save(undefined as any, mockApiKey).catch((err) => {
        expect(err).toEqual(Error('Suppression data is missing'))
      })
    });

    it('should throw an error when API Key not defined', async () => {
      const suppressionService = new SuppressionService(mockSuppressionsUri);

      await suppressionService.save(suppression, undefined as any).catch((err) => {
        expect(err).toEqual(Error('Key is missing'))
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
