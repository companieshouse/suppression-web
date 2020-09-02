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
      }
    };

    const mockRequest: any = {
      session: { extra_data: { suppression:  suppressionData  } }
    };

    expect(SessionService.getSuppressionSession(mockRequest)).toEqual(suppressionData)

  });

  it('should return undefined when no suppression data exists in the session', () => {

    const mockRequest: any = {
      session: {}
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
      }
    };

    const mockRequest: any = {
      session: {}
    };

    SessionService.setSuppressionSession(mockRequest, suppressionData);
    expect(mockRequest.session.extra_data[SUPPRESSION_DATA_KEY]).toEqual(suppressionData)
  })

});
