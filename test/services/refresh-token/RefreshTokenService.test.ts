import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { RefreshTokenData } from '../../../src/services/refresh-token/RefreshTokenData';
import { RefreshTokenService } from '../../../src/services/refresh-token/RefreshTokenService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RefreshTokenService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNewAccessToken: string = 'new-token';
  const mockAccessToken: string = 'token';
  const mockRefreshToken: string = 'refresh-token';
  const mockRefreshClientId: string = '1';
  const mockRefreshClientSecret: string = 'ABC';
  const mockRefreshServiceUri: string = 'http://localhost/oauth2/token';

  const refreshTokenData: RefreshTokenData = {
    'expires_in': 3600,
    'token_type': 'Bearer',
    'access_token': `${mockNewAccessToken}`
  };

  describe('Refreshing token', () => {
    it('should throw an error when Access token not defined', async () => {
      const refreshTokenService = new RefreshTokenService(mockRefreshServiceUri, mockRefreshClientId, mockRefreshClientSecret);

      for (const data of [undefined, null]) {
        await refreshTokenService.refresh(data as any, mockRefreshToken).catch((err) => {
          expect(err).toEqual(Error('Access token is missing'))
        });
      }
    });

    it('should throw an error when refresh token not defined', async () => {
      const refreshTokenService = new RefreshTokenService(mockRefreshServiceUri, mockRefreshClientId, mockRefreshClientSecret);

      for (const data of [undefined, null]) {
        await refreshTokenService.refresh(mockAccessToken, data as any).catch((err) => {
          expect(err).toEqual(Error('Refresh token is missing'))
        });
      }
    });

    it('should refresh access token', async () => {

      mockedAxios.post.mockImplementationOnce(() => Promise.resolve({
        status: StatusCodes.OK,
        data: refreshTokenData
      }));

      const refreshTokenService = new RefreshTokenService(mockRefreshServiceUri, mockRefreshClientId, mockRefreshClientSecret);

      await refreshTokenService.refresh(mockAccessToken, mockRefreshToken).then((response: string) => {
        expect(response).toEqual(mockNewAccessToken)
      });

    });

    it('should throw error when response is empty', async () => {

      mockedAxios.post.mockReturnValue(Promise.resolve({
        status: StatusCodes.OK
      }));

      const refreshTokenService = new RefreshTokenService(mockRefreshServiceUri, mockRefreshClientId, mockRefreshClientSecret);

      await refreshTokenService.refresh(mockAccessToken, mockRefreshToken).catch((err) => {
        expect(err).toEqual(new Error('Could not refresh access token'));
      });

    });

    it('should return status 400 when refresh token is invalid', async () => {

      const errorResponse = {
        message: 'Request failed with status code 400',
        response: {
          status: StatusCodes.BAD_REQUEST
        }
      };

      mockedAxios.post.mockReturnValue(Promise.reject(errorResponse));

      const refreshTokenService = new RefreshTokenService(mockRefreshServiceUri, mockRefreshClientId, mockRefreshClientSecret);

      await refreshTokenService.refresh(mockAccessToken, mockRefreshToken).catch((err) => {
        expect(err).toEqual(errorResponse);
      });
    });
  });
});
