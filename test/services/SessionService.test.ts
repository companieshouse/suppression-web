import SessionService from '../../src/services/SessionService';
import { SuppressionData } from '../../src/models/SuppressionDataModel';

describe('SessionService', () => {

  it('should retrieve suppression data from the session', async () => {

    const suppressionData: SuppressionData = {
      applicantDetails: { fullName: 'test-name', emailAddress: 'test-email' }
    };

    const mockRequest: any = {
      session: { extra_data: { suppression:  suppressionData  } }
    };

    expect(SessionService.getSuppressionSession(mockRequest)).toEqual(suppressionData)

  });

  it('should return undefined when no suppression data exists in the session', async () => {

    const mockRequest: any = {
      session: {}
    };

    expect(SessionService.getSuppressionSession(mockRequest)).toBeUndefined();

  });

  it('should set the suppression data in the session', async () => {

    const suppressionData: SuppressionData = {
      applicantDetails: { fullName: 'test-name', emailAddress: 'test-email'}
    };

    const mockRequest: any = {
      session: {}
    };

    SessionService.setSuppressionSession(mockRequest, suppressionData);
    expect(mockRequest.session.extra_data.SUPPRESSION_DATA_KEY).toEqual(suppressionData)
  })

});
