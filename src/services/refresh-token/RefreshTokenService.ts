import { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { loggerInstance } from '../../utils/Logger';
import { RefreshTokenData } from './RefreshTokenData';

export class RefreshTokenService {

  private readonly REFRESH_TOKEN_GRANT_TYPE: string = 'refresh_token';

  constructor(private readonly uri: string, private readonly clientId: string,
              private readonly clientSecret: string) {
    this.uri = uri;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public async refresh(accessToken: string, refreshToken: string): Promise<string> {

    if (accessToken == null) {
      throw new Error('Access token is missing');
    }

    if (refreshToken == null) {
      throw new Error('Refresh token is missing');
    }

    const requestParams: AxiosRequestConfig = {
      params: {
        'grant_type': this.REFRESH_TOKEN_GRANT_TYPE,
        'refresh_token': refreshToken,
        'client_id': this.clientId,
        'client_secret': this.clientSecret
      }
    };

    loggerInstance().info(`Making a POST request to ${this.uri} for refreshing access token ${accessToken}`);

    return await axios
      .post(this.uri, null, requestParams)
      .then((response: AxiosResponse<RefreshTokenData>) => {
        if (response.status === StatusCodes.OK && response.data) {
          loggerInstance()
            .debug(`${RefreshTokenService.name} - refresh: created new access token - ${response.data.access_token}`);
          return response.data.access_token;
        }
        throw new Error('Could not refresh access token');
      });
  }
}
