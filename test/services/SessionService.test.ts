import { Session } from 'ch-node-session-handler';
import { Request } from 'express';
import { SuppressionData, SUPPRESSION_DATA_KEY } from '../../src/models/SuppressionDataModel';
import SessionService from '../../src/services/SessionService';

const mockSuppressionData: SuppressionData = {
  applicantDetails: {
    fullName: 'test-name',
    emailAddress: 'test-email'
  },
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

const mockRequestData = {
  session: {
    get: jest.fn(),
    data: jest.fn(),
    getExtraData: jest.fn(),
    setExtraData: jest.fn(),
    deleteExtraData: jest.fn(),
    verify: jest.fn()
  } as unknown as Session
} as Request;

describe('SessionService', () => {

  it('should retrieve suppression data from the session', () => {

    const suppressionData: SuppressionData = mockSuppressionData;
    const mockRequest: Request = mockRequestData;

    const mockGetExtraData = jest.fn().mockReturnValue(suppressionData);
    mockRequest.session!.getExtraData = mockGetExtraData;

    expect(SessionService.getSuppressionSession(mockRequest)).toEqual(suppressionData);
    expect(mockGetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY);
  });

  it('should return undefined when no suppression data exists in the session', () => {

    const mockRequest: Request = mockRequestData;

    const mockGetExtraData: jest.Mock = jest.fn().mockReturnValue(undefined);
    mockRequest.session!.getExtraData = mockGetExtraData;

    expect(SessionService.getSuppressionSession(mockRequest)).toBeUndefined();
    expect(mockGetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY);
  });

  it('should set the suppression data in the session', () => {

    const suppressionData: SuppressionData = mockSuppressionData;
    const mockRequest: Request = mockRequestData;

    const mockSetExtraData: jest.Mock = jest.fn();
    mockRequest.session!.setExtraData = mockSetExtraData;

    SessionService.setSuppressionSession(mockRequest, suppressionData);

    expect(mockSetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY, suppressionData);
  })

});
