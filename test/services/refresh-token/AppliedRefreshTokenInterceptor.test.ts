import { StatusCodes } from 'http-status-codes';
import nock = require('nock');
import { ApplicantDetails, SuppressionData } from '../../../src/models/SuppressionDataModel';
import { RefreshTokenData } from '../../../src/services/refresh-token/RefreshTokenData';
import { RefreshTokenService } from '../../../src/services/refresh-token/RefreshTokenService';
import {
  SuppressionServiceError,
  SuppressionUnauthorisedError,
} from '../../../src/services/suppression/errors';
import { SuppressionService } from '../../../src/services/suppression/SuppressionService';
import { generateTestData } from '../../TestData';

const mockAccessToken: string = 'token';
const mockNewAccessToken: string = 'new-token';
const mockRefreshToken: string = 'refresh-token';
const mockGeneratedReference: string = '123123';
const mockSuppressionUri: string = '/suppressions';

const mockApiHost: string = 'http://localhost';

const mockRefreshClientId: string = '1';
const mockRefreshClientSecret: string = 'ABC';
const mockRefreshGrantType: string = 'refresh_token';
const mockRefreshParams: string = `?grant_type=${mockRefreshGrantType}&refresh_token=${mockRefreshToken}` +
  `&client_id=${mockRefreshClientId}&client_secret=${mockRefreshClientSecret}`;
const mockRefreshServiceUri: string = '/oauth2/token';

const refreshTokenData: RefreshTokenData = {
  'expires_in': 3600,
  'token_type': 'Bearer',
  'access_token': `${mockNewAccessToken}`
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

  const refreshTokenService: RefreshTokenService = new RefreshTokenService(mockApiHost + mockRefreshServiceUri, mockRefreshClientId, mockRefreshClientSecret);

  describe('saving suppression', () => {

    const mockSuppressionData: ApplicantDetails = generateTestData().applicantDetails;

    it('should refresh expired access token and save suppression', async () => {

      nock(mockApiHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.OK, refreshTokenData);

      nock(mockApiHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.CREATED, mockGeneratedReference, {location: '/suppressions/123123'});

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);

      await suppressionService.save(mockSuppressionData, mockAccessToken, mockRefreshToken).then((response: string) => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(response).toEqual(mockGeneratedReference);
      });
    });

    it('should return error when refresh token fails with status code 400 Bad Request', async () => {

      nock(mockApiHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.BAD_REQUEST);

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);
      await suppressionService.save(mockSuppressionData, mockAccessToken, mockRefreshToken).catch(err => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(err).toEqual(new SuppressionServiceError('save suppression failed with message: Request failed with status code 400'));
      });
    });

    it('should return error when access token is invalid second time around', async () => {

      nock(mockApiHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.OK, refreshTokenData);

      nock(mockApiHost)
        .post(mockSuppressionUri, JSON.stringify(mockSuppressionData), {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);

      await suppressionService.save(mockSuppressionData, mockAccessToken, mockRefreshToken).catch(err => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(err).toEqual(new SuppressionUnauthorisedError('save suppression unauthorised'));
      });
    });

  });

  describe('get suppression', () => {

    const mockSuppressionData: SuppressionData = generateTestData();

    it('should retrieve full suppression when token has expired', async () => {

      nock(mockApiHost)
        .get(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.OK, refreshTokenData);

      nock(mockApiHost)
        .get(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.OK, mockSuppressionData);

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);

      await suppressionService.get(mockGeneratedReference, mockAccessToken, mockRefreshToken).then((response: SuppressionData) => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(response).toEqual(mockSuppressionData)
      });
    });

    it('should return error when refresh token fails with status code 400 Bad Request', async () => {

      nock(mockApiHost)
        .get(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.BAD_REQUEST);

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);

      await suppressionService.get(mockGeneratedReference, mockAccessToken, mockRefreshToken).catch((err) => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(err).toEqual(new SuppressionUnauthorisedError('get suppression failed with message: Request failed with status code 400'));
      });
    });

    it('should return error when access token is invalid second time around', async () => {

      nock(mockApiHost)
        .get(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.OK, refreshTokenData);

      nock(mockApiHost)
        .get(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);

      await suppressionService.get(mockGeneratedReference, mockAccessToken, mockRefreshToken).catch((err) => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(err).toEqual(new SuppressionUnauthorisedError('get suppression unauthorised'));
      });
    });

  });

  describe('patching suppression', () => {

    const mockPartialData = {applicantDetails: generateTestData().applicantDetails};

    it('should return No Content when partial data saved and token has expired', async () => {

      nock(mockApiHost)
        .patch(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.OK, refreshTokenData);

      nock(mockApiHost)
        .patch(mockSuppressionUri + `/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.NO_CONTENT);

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);

      await suppressionService.patch(mockPartialData, mockGeneratedReference, mockAccessToken, mockRefreshToken).then(response => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(response).toBeUndefined();
      });
    });

    it('should return error when refresh token fails with status code 400 Bad Request', async () => {

      nock(mockApiHost)
        .patch(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.BAD_REQUEST);

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);

      await suppressionService.patch(mockPartialData, mockGeneratedReference, mockAccessToken, mockRefreshToken).catch(err => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(err).toEqual(new SuppressionUnauthorisedError('patch suppression failed with message: Request failed with status code 400'));
      });
    });

    it('should return error when access token is invalid second time around', async () => {

      nock(mockApiHost)
        .patch(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const refreshTokenMock = nock(mockApiHost)
        .post(`${mockRefreshServiceUri}${mockRefreshParams}`)
        .reply(StatusCodes.OK, refreshTokenData);

      nock(mockApiHost)
        .patch(`${mockSuppressionUri}/${mockGeneratedReference}`, undefined, {
            reqheaders: getRequestHeaders(mockNewAccessToken)
          }
        ).reply(StatusCodes.UNAUTHORIZED);

      const suppressionService: SuppressionService = new SuppressionService(mockApiHost, refreshTokenService);

      await suppressionService.patch(mockPartialData, mockGeneratedReference, mockAccessToken, mockRefreshToken).catch(err => {
        expect(refreshTokenMock.isDone()).toBeTruthy();
        expect(err).toEqual(new SuppressionUnauthorisedError('patch suppression unauthorised'));
      });
    });

  });

});
