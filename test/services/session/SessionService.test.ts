import { Session } from '@companieshouse/node-session-handler';
import { SessionKey } from '@companieshouse/node-session-handler/lib/session/keys/SessionKey';
import { Request } from 'express';

import { SuppressionSession, SUPPRESSION_DATA_KEY } from '../../../src/models/SuppressionSessionModel';
import SessionService from '../../../src/services/session/SessionService';

const mockSuppressionSessionData: SuppressionSession = {
  applicationReference: 'TESTS-TESTS',
  navigationPermissions: [],
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

    const mockGetExtraData = jest.fn().mockReturnValue(mockSuppressionSessionData);
    mockRequest.session!.getExtraData = mockGetExtraData;

    expect(SessionService.getSuppressionSession(mockRequest)).toEqual(mockSuppressionSessionData);
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

    SessionService.setSuppressionSession(mockRequest, mockSuppressionSessionData);

    expect(mockSetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY, mockSuppressionSessionData);
  });

  it('should reset the session by stashing the application reference and clearing all other data', () => {

    const mockRequest: Request = mockRequestData;
    const mockSuppressionSession: SuppressionSession = mockSuppressionSessionData;

    mockRequest.session!.getExtraData = jest.fn().mockReturnValue(mockSuppressionSession);
    const mockSetExtraData: jest.Mock = jest.fn();
    mockRequest.session!.setExtraData = mockSetExtraData;

    SessionService.resetSuppressionSession(mockRequest);

    const expectedUpdatedSession = {
      submittedApplicationReference: mockSuppressionSession.applicationReference
    } as SuppressionSession;
    expect(mockSetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY, expectedUpdatedSession);
  });

  it('should initialise the navigation permissions and set the supplied permission when the permission list doesn’t exist yet', () => {

    const mockRequest: Request = mockRequestData;

    const mockSuppressionSession = {
      applicationReference: mockSuppressionSessionData.applicationReference,
      paymentDetails: mockSuppressionSessionData.paymentDetails
    } as SuppressionSession

    mockRequest.session!.getExtraData = jest.fn().mockReturnValue(mockSuppressionSession);
    const mockSetExtraData: jest.Mock = jest.fn();
    mockRequest.session!.setExtraData = mockSetExtraData;

    SessionService.appendNavigationPermissions(mockRequest, 'TEST_URI')

    const expectedUpdatedSession = {
      ...mockSuppressionSession,
      navigationPermissions: [ 'TEST_URI' ]
    } as SuppressionSession;
    expect(mockSetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY, expectedUpdatedSession);
  });

  it('should only append a new permission to the navigation permissions if the new permission isn’t already present', () => {

    const mockRequest: Request = mockRequestData;

    const mockSuppressionSession: SuppressionSession = { ...mockSuppressionSessionData }
    mockSuppressionSession.navigationPermissions = [ 'TEST_URI' ]

    mockRequest.session!.getExtraData = jest.fn().mockReturnValue(mockSuppressionSession);
    const mockSetExtraData: jest.Mock = jest.fn();
    mockRequest.session!.setExtraData = mockSetExtraData;

    SessionService.appendNavigationPermissions(mockRequest, 'TEST_URI')

    const expectedUpdatedSession: SuppressionSession = { ...mockSuppressionSession };
    expectedUpdatedSession.navigationPermissions = [ 'TEST_URI' ];
    expect(mockSetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY, expectedUpdatedSession);
  });

  it('should not append a new permission to the navigation permissions if the new permission is already present', () => {

    const mockRequest: Request = mockRequestData;

    const mockSuppressionSession: SuppressionSession = { ...mockSuppressionSessionData }
    mockSuppressionSession.navigationPermissions = [ 'TEST_URI' ]

    mockRequest.session!.getExtraData = jest.fn().mockReturnValue(mockSuppressionSession);
    const mockSetExtraData: jest.Mock = jest.fn();
    mockRequest.session!.setExtraData = mockSetExtraData;

    SessionService.appendNavigationPermissions(mockRequest, 'TEST_URI')

    const expectedUpdatedSession: SuppressionSession = { ...mockSuppressionSession };
    expectedUpdatedSession.navigationPermissions = [ 'TEST_URI' ];
    expect(mockSetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY, expectedUpdatedSession);
  });

  it('should append a new permission to the navigation permissions if the new permission isn’t already present', () => {

    const mockRequest: Request = mockRequestData;

    const mockSuppressionSession: SuppressionSession = { ...mockSuppressionSessionData }
    mockSuppressionSession.navigationPermissions = [ 'FIRST_TEST_URI' ]

    mockRequest.session!.getExtraData = jest.fn().mockReturnValue(mockSuppressionSession);
    const mockSetExtraData: jest.Mock = jest.fn();
    mockRequest.session!.setExtraData = mockSetExtraData;

    SessionService.appendNavigationPermissions(mockRequest, 'SECOND_TEST_URI')

    const expectedUpdatedSession: SuppressionSession = { ...mockSuppressionSession };
    expectedUpdatedSession.navigationPermissions = [ 'FIRST_TEST_URI', 'SECOND_TEST_URI' ];
    expect(mockSetExtraData).toHaveBeenCalledWith(SUPPRESSION_DATA_KEY, expectedUpdatedSession);
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
  });

  it('should retrieve the email address from the session', () => {

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
  });

  it('should retrieve the refresh token from the session', () => {

    const testToken = 'test-token';
    const mockRequest: Request = mockRequestData;

    const mockGetSignInInfo: jest.Mock = jest.fn(() => {
      return {
        access_token: {
          refresh_token: testToken
        },
        user_profile: {
          email: 'test@example.com'
        }
      }
    });
    mockRequest.session!.get = mockGetSignInInfo;

    const result = SessionService.getRefreshToken(mockRequest);
    expect(result).toEqual(testToken);
    expect(mockGetSignInInfo).toHaveBeenCalledWith(SessionKey.SignInInfo);
  });

});
