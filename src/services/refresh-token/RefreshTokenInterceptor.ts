import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { loggerInstance } from '../../utils/Logger';
import { RefreshTokenService } from './RefreshTokenService';

export class RefreshTokenInterceptor {

  private readonly axiosInstance: AxiosInstance;
  private readonly refreshTokenService: RefreshTokenService;

  constructor(axiosInstance: AxiosInstance, refreshTokenService: RefreshTokenService) {
    this.axiosInstance = axiosInstance;
    this.refreshTokenService = refreshTokenService;
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

        const newAccessToken: string = await this.refreshTokenService.refresh(accessToken, refreshToken);
        if (newAccessToken) {
          originalRequestConfig.headers = RefreshTokenInterceptor.getHeaders(newAccessToken);
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
