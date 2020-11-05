import * as nodeSdk from '@companieshouse/api-sdk-node';
import ApiClient from '@companieshouse/api-sdk-node/dist/client';
import { StatusCodes } from 'http-status-codes';
import nock = require('nock');
import { ApplicantDetails, SuppressionData } from '../../src/models/SuppressionDataModel';
import {
  SuppressionUnauthorisedError,
} from '../../src/services/suppression/errors';
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { generateTestData } from '../TestData';

const MockedAPIClient = ApiClient as jest.Mock<ApiClient>;
const accountApiClient = new MockedAPIClient() as jest.Mocked<ApiClient>;

const mockAccessToken: string = 'token';
const mockNewAccessToken: string = 'new-token';
const mockRefreshToken: string = 'refresh-token';
const mockGeneratedReference: string = '123123';
const mockSuppressionHost: string = 'http://localhost';
const mockSuppressionUri: string = '/suppressions';

const refreshTokenResponse = {
  httpStatusCode: StatusCodes.OK,
  resource: {
    expires_in: 111,
    token_type: '',
    access_token: mockNewAccessToken,
  }
};

const getRequestHeaders = (accessToken: string) => (
  {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
);

describe('Applied refresh token interceptor', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saving suppression', () => {

    const mockSuppressionData: ApplicantDetails = generateTestData().applicantDetails;

    it('should refresh access token when expired and save suppression', async () => {

      nock(mockSuppressionHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = jest.fn().mockReturnValue(Promise.resolve(refreshTokenResponse));

      accountApiClient.refreshToken.refresh = refreshTokenMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => accountApiClient);

      nock(mockSuppressionHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.CREATED, mockGeneratedReference, {location: '/suppressions/123123'});

      const suppressionService = new SuppressionService(mockSuppressionHost);

      await suppressionService.save(mockSuppressionData, mockAccessToken, mockRefreshToken).then((response: string) => {
        expect(refreshTokenMock).toHaveBeenCalledWith(mockRefreshToken, 'refresh_token', undefined, undefined);
        expect(response).toEqual(mockGeneratedReference);
      });
    });

    it('should return status 401 when expired token refresh fails with 401', async () => {

      nock(mockSuppressionHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = jest.fn().mockReturnValue(Promise.resolve({
        httpStatusCode: StatusCodes.UNAUTHORIZED
      }));

      accountApiClient.refreshToken.refresh = refreshTokenMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => accountApiClient);

      const suppressionService = new SuppressionService(mockSuppressionHost);
      await suppressionService.save(mockSuppressionData, mockAccessToken, mockRefreshToken).catch(err => {
        expect(refreshTokenMock).toHaveBeenCalledWith(mockRefreshToken, 'refresh_token', undefined, undefined);
        expect(err).toEqual(new SuppressionUnauthorisedError('save suppression unauthorised'));
      });
    });

    it('should return status 401 when auth header is invalid second time around', async () => {

      nock(mockSuppressionHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = jest.fn().mockReturnValue(Promise.resolve(refreshTokenResponse));

      accountApiClient.refreshToken.refresh = refreshTokenMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => accountApiClient);

      nock(mockSuppressionHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const suppressionService = new SuppressionService(mockSuppressionHost);
      await suppressionService.save(mockSuppressionData, mockAccessToken, mockRefreshToken).catch(err => {
        expect(refreshTokenMock).toHaveBeenCalledWith(mockRefreshToken, 'refresh_token', undefined, undefined);
        expect(err).toEqual(new SuppressionUnauthorisedError('save suppression unauthorised'));
      });
    });

  });

  describe('get suppression', () => {

    it('should retrieve full suppression when token has expired', async () => {

      nock(mockSuppressionHost)
        .get(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = jest.fn().mockReturnValue(Promise.resolve(refreshTokenResponse));

      accountApiClient.refreshToken.refresh = refreshTokenMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => accountApiClient);

      nock(mockSuppressionHost)
        .get(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.OK, generateTestData());

      const suppressionService = new SuppressionService(mockSuppressionHost);

      await suppressionService.get(mockGeneratedReference, mockAccessToken, mockRefreshToken).then((response: SuppressionData) => {
        expect(refreshTokenMock).toHaveBeenCalledWith(mockRefreshToken, 'refresh_token', undefined, undefined);
        expect(response).toEqual(generateTestData())
      });
    });

  });

  describe('patching suppression', () => {

    const mockPartialData = {applicantDetails: generateTestData().applicantDetails};

    it('should return No Content when partial data saved and token has expired', async () => {

      nock(mockSuppressionHost)
        .patch(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = jest.fn().mockReturnValue(Promise.resolve(refreshTokenResponse));

      accountApiClient.refreshToken.refresh = refreshTokenMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => accountApiClient);

      nock(mockSuppressionHost)
        .patch(mockSuppressionUri + `/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.NO_CONTENT);


      const suppressionService = new SuppressionService(mockSuppressionHost);

      await suppressionService.patch(mockPartialData, mockGeneratedReference, mockAccessToken, mockRefreshToken).then(response => {
        expect(refreshTokenMock).toHaveBeenCalledWith(mockRefreshToken, 'refresh_token', undefined, undefined);
        expect(response).toBeUndefined();
      });
    });

  });

});
