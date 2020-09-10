
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { OK } from 'http-status-codes';
import { RefreshTokenData, REFRESH_TOKEN_GRANT_TYPE } from '../../models/RefreshTokenData';

export class RefreshTokenService {

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
        'grant_type': REFRESH_TOKEN_GRANT_TYPE,
        'refresh_token': refreshToken,
        'client_id': this.clientId,
        'client_secret': this.clientSecret
      }
    };

    console.log(`Making a POST request to ${this.uri} for refreshing access token ${accessToken}`)

    return await axios
      .post(this.uri, null, requestParams)
      .then((response: AxiosResponse<RefreshTokenData>) => {
        if (response.status === OK && response.data) {
          console.log(`${RefreshTokenService.name} - refresh: created new access token - ${response.data.access_token}`);
          return response.data.access_token;
        }
        throw new Error('Could not refresh access token');
      });
  }
}
