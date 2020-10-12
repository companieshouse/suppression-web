import { Session } from 'ch-node-session-handler';
import { SessionKey } from 'ch-node-session-handler/lib/session/keys/SessionKey';
import { Request } from 'express';

import { SuppressionSession, SUPPRESSION_DATA_KEY } from '../../../src/models/suppressionSessionModel';
import SessionService from '../../../src/services/session/SessionService';

const mockSuppressionSession: SuppressionSession = {
  applicationReference: 'TESTS-TESTS',
  paymentDetails: {
    stateUUID: 'mockUUID',
    resourceUri: 'mockURI'
  }
}

const mockRequestData = {
  session: {
    getExtraData: jest.fn() as any
  } as Session
} as Request;

describe('SessionService', () => {

  it('should retrieve suppression data from the session', () => {

    const mockRequest: Request = mockRequestData;

    const mockGetExtraData = jest.fn().mockReturnValue(mockSuppressionSession);
    mockRequest.session!.getExtraData = mockGetExtraData;

    expect(SessionService.getSuppressionSession(mockRequest)).toEqual(mockSuppressionSession);
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

    const mockRequest: Request = mockRequestData;

    const mockSetExtraData: jest.Mock = jest.fn();
    mockRequest.session!.setExtraData = mockSetExtraData;

    SessionService.setSuppressionSession(mockRequest, mockSuppressionSession);

    expect(mockSetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY, mockSuppressionSession);
  });

  it('should retrieve the access token from the session', () => {

    const testToken = 'test-token';
    const mockRequest: Request = mockRequestData;

    const mockGetSignInInfo: jest.Mock = jest.fn(() => {
      return {
        access_token: {
          access_token: testToken
        },
        user_profile: {
          email: 'test@example.com'
        }
      }
    });
    mockRequest.session!.get = mockGetSignInInfo;

    const result = SessionService.getAccessToken(mockRequest);
    expect(result).toEqual(testToken);
    expect(mockGetSignInInfo).toHaveBeenCalledWith(SessionKey.SignInInfo);
  })

  it('should retrieve the access token from the session', () => {

    const testEmail = 'test@example.com';
    const mockRequest: Request = mockRequestData;

    const mockGetSignInInfo: jest.Mock = jest.fn(() => {
      return {
        access_token: {
          access_token: 'test-token'
        },
        user_profile: {
          email: testEmail
        }
      }
    });
    mockRequest.session!.get = mockGetSignInInfo;

    const result = SessionService.getUserEmail(mockRequest);
    expect(result).toEqual(testEmail);
    expect(mockGetSignInInfo).toHaveBeenCalledWith(SessionKey.SignInInfo);
  })

});
