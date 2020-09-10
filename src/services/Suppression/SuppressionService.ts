import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes, UNAUTHORIZED } from 'http-status-codes/build';
import { SuppressionData } from '../../models/SuppressionDataModel';
import { getConfigValue } from '../../modules/config-handler/ConfigHandler';
import { RefreshTokenService } from '../refresh-token-service/RefreshTokenService';
import { SuppressionServiceError, SuppressionUnauthorisedError, SuppressionUnprocessableEntityError } from './errors';


export class SuppressionService {

  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly uri: string, private readonly refreshTokenService: RefreshTokenService) {
    this.uri = uri;
    this.refreshTokenService = refreshTokenService;
    this.axiosInstance = axios.create();
  }

  public async saveSuppression(suppression: SuppressionData, accessToken: string , refreshToken: string): Promise<string> {

    this.refreshTokenInterceptor(accessToken, refreshToken);

    const uri: string = `${this.uri}/suppressions`;

    console.log(`${SuppressionService.name} - Making a POST request to ${uri}`);

    return await this.axiosInstance
      .post(uri, suppression)
      .then((response: AxiosResponse<string>) => {
        if (response.status === StatusCodes.CREATED && response.headers.location) {
          console.log(`${SuppressionService.name} - save: created resource ${response.data} - ${response.headers.location}`);
          return response.data.toString()
        }
        throw new Error('Could not create suppression resource');
      })
      .catch(this.handleResponseError('save'))

  }

  private handleResponseError(operation: 'save'): (_: AxiosError) => never {
    return (err: AxiosError) => {
      if (err.isAxiosError && err.response != null) {
        switch (err.response.status) {
          case StatusCodes.UNAUTHORIZED:
            throw new SuppressionUnauthorisedError(`${operation} appeal unauthorised`);
          case StatusCodes.UNPROCESSABLE_ENTITY:
            throw new SuppressionUnprocessableEntityError(`${operation} appeal on invalid appeal data`);
        }
      }

      throw new SuppressionServiceError(`${operation} suppression failed with message ${err.message || 'unknown error'}: `);
    };
  };

  private refreshTokenInterceptor(accessToken: string, refreshToken: string): void {

    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
      config.headers = this.getHeaders(accessToken);
      return config
    }, async (error: AxiosError) => {
        return Promise.reject(error)
    });

    this.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
      return response;
    }, async (error) => {

      const requestConfig = error.config;
      const response: AxiosResponse | undefined = error.response;

      if (response && response.status === StatusCodes.UNAUTHORIZED && !requestConfig._isRetry) {
        requestConfig._isRetry = true;
        console.log(`${SuppressionService.name} - create suppression failed with: ${response.status} - attempting token refresh`);
        const newAccessToken: string = await this.refreshTokenService.refresh(accessToken, refreshToken);
        if (newAccessToken) {
          requestConfig.headers = this.getHeaders(newAccessToken);
          return this.axiosInstance(requestConfig);
        }
      }
      return Promise.reject(error);
    });

  }

  private getHeaders(token: string): AxiosRequestConfig['headers'] {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
  }
}
