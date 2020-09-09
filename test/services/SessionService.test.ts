import { SuppressionData, SUPPRESSION_DATA_KEY } from '../../src/models/SuppressionDataModel';
import SessionService from '../../src/services/SessionService';

describe('SessionService', () => {

  it('should retrieve suppression data from the session', () => {

    const suppressionData: SuppressionData = {
      applicantDetails: { fullName: 'test-name', emailAddress: 'test-email' },
      addressToRemove: {
        line1: '1 Test Street',
        line2: '',
        town: 'Test Town',
        county: 'Test Midlands',
        postcode: 'TE10 6ST'
      },
      documentDetails: {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        date: '2020-01-01'
      }
    };

    const mockRequest: any = {
      session: { data: { extra_data: { suppression:  suppressionData  } } }
    };

    expect(SessionService.getSuppressionSession(mockRequest)).toEqual(suppressionData)

  });

  it('should return undefined when no suppression data exists in the session', () => {

    const mockRequest: any = {
      session: { data: { extra_data: {} } }
    };

    expect(SessionService.getSuppressionSession(mockRequest)).toBeUndefined();

  });

  it('should set the suppression data in the session', () => {

    const suppressionData: SuppressionData = {
      applicantDetails: { fullName: 'test-name', emailAddress: 'test-email'},
      addressToRemove: {
        line1: '1 Test Street',
        line2: '',
        town: 'Test Town',
        county: 'Test Midlands',
        postcode: 'TE10 6ST'
      },
      documentDetails: {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        date: '2020-01-01'
      }
    };

    const mockRequest: any = {
      session: { data: { extra_data: {} }}
    };

    SessionService.setSuppressionSession(mockRequest, suppressionData);
    expect(mockRequest.session.data.extra_data[SUPPRESSION_DATA_KEY]).toEqual(suppressionData)
  })

});
