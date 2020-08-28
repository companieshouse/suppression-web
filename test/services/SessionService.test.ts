import SessionService from '../../src/services/SessionService';
import { SuppressionData } from '../../src/models/SuppressionDataModel';

describe('SessionService', () => {

  it('should retrieve information from session if present', async () => {

    const suppressionData: SuppressionData = {
      applicantDetails: { fullName: 'test-name', emailAddress: 'test-email' }
    };

    const mockRequest: any = {
      session: { ExtraData: suppressionData }
    };

    expect(SessionService.getSuppressionSession(mockRequest)).toEqual(suppressionData)

  });

  it('should retrieve undefined from session if no data set', async () => {

    const mockRequest: any = {
      session: {}
    };

    expect(SessionService.getSuppressionSession(mockRequest)).toBeUndefined();

  });

  it('should set information in session', async () => {

    const suppressionData: SuppressionData = {
      applicantDetails: { fullName: 'test-name', emailAddress: 'test-email'}
    };

    const mockRequest: any = {
      session: { ExtraData: {} }
    };

    SessionService.setSuppressionSession(mockRequest, suppressionData);
    expect(mockRequest.session.ExtraData).toEqual(suppressionData)
  })

});
