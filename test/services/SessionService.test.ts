import { SuppressionData } from '../../src/models/SuppressionDataModel';
import SessionService from '../../src/services/SessionService';

const getSuppressionData: SuppressionData = {
    applicantDetails: {fullName: 'test-name', emailAddress: 'test-email'},
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

describe('SessionService', () => {

  it('should retrieve suppression data from the session', () => {

    const suppressionData: SuppressionData = getSuppressionData;

    const mockRequest: any = {
      session: { extra_data: { suppression:  suppressionData  } }
    };


    mockRequest.session!.getExtraData = jest.fn().mockReturnValue(suppressionData);

    expect(SessionService.getSuppressionSession(mockRequest)).toEqual(suppressionData)

  });

  it('should return undefined when no suppression data exists in the session', () => {

    const mockRequest: any = {
      session: { extra_data: {}  }
    };

    mockRequest.session!.getExtraData = jest.fn().mockReturnValue(undefined);

    expect(SessionService.getSuppressionSession(mockRequest)).toBeUndefined();

  });

  it('should set the suppression data in the session', () => {

    const suppressionData: SuppressionData = getSuppressionData;

    const mockRequest: any = {
      session: { extra_data: {} }
    };

    const setExtraDataMock: jest.Mock = jest.fn();
    mockRequest.session!.setExtraData = setExtraDataMock;

    SessionService.setSuppressionSession(mockRequest, suppressionData);

    expect(setExtraDataMock).toHaveBeenCalledWith('suppression', suppressionData);
  })

});
