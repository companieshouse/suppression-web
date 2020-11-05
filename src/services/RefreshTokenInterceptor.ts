import { createApiClient } from '@companieshouse/api-sdk-node';
import ApiClient from '@companieshouse/api-sdk-node/dist/client';
import { RefreshTokenData } from '@companieshouse/api-sdk-node/dist/services/refresh-token';
import Resource from '@companieshouse/api-sdk-node/dist/services/resource';
import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { loggerInstance } from '../utils/Logger';

export class RefreshTokenInterceptor {

  private readonly axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  public initialise(accessToken: string, refreshToken: string): void {

    this.initialiseRequestInterceptor(accessToken);
    this.initialiseResponseInterceptor(accessToken, refreshToken);
  }

  private initialiseRequestInterceptor(accessToken: string): void {

    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {

        if (!config.headers.Authorization) {
          config.headers = RefreshTokenInterceptor.getHeaders(accessToken);
        }
        return config;
      },
      async (error: AxiosError) => {
        return Promise.reject(error);
      });
  }

  private initialiseResponseInterceptor(accessToken: string, refreshToken: string): void {

    this.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
      return response;
    }, async (error) => {

      const originalRequestConfig = error.config;
      const response: AxiosResponse | undefined = error.response;

      if (response && response.status === StatusCodes.UNAUTHORIZED && !originalRequestConfig._isRetry) {

        loggerInstance().info(`${RefreshTokenInterceptor.name} - Suppression API request failed with: ${response.status}`
          + ' - Refreshing access token');

        originalRequestConfig._isRetry = true;

        const accountApiClient: ApiClient = createApiClient(undefined, accessToken);
        const refreshTokenResponse: Resource<RefreshTokenData> = await accountApiClient.refreshToken.refresh(
          refreshToken, 'refresh_token', getConfigValue('OAUTH2_CLIENT_ID')!,
          getConfigValue('OAUTH2_CLIENT_SECRET')!);

        if (refreshTokenResponse.resource) {
          originalRequestConfig.headers = RefreshTokenInterceptor.getHeaders(refreshTokenResponse.resource.access_token);
          loggerInstance().info(`${RefreshTokenInterceptor.name} - Access token successfully refreshed`);
          return this.axiosInstance(originalRequestConfig);
        }
      }
      return Promise.reject(error);
    });
  }

  private static getHeaders(token: string): AxiosRequestConfig['headers'] {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
  }

}
