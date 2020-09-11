import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes/build';
import { SuppressionData } from '../../models/SuppressionDataModel';
import { SuppressionServiceError, SuppressionUnauthorisedError, SuppressionUnprocessableEntityError } from './errors';


export class SuppressionService {

  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly uri: string) {
    this.uri = uri;
    this.axiosInstance = axios.create();
  }

  public async save(suppression: SuppressionData, accessToken: string): Promise<string> {

    this.checkArgumentOrThrow(suppression, 'Suppression data is missing');
    this.checkArgumentOrThrow(accessToken, 'Access token is missing');

    const uri: string = `${this.uri}/suppressions`;

    console.log(`${SuppressionService.name} - Making a POST request to ${uri}`);

    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
      config.headers = this.getHeaders(accessToken);
      return config
    }, async (error: AxiosError) => {
      return Promise.reject(error)
    });

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

  private checkArgumentOrThrow<T>(arg: T, errorMessage: string): void {
    if (arg == null) {
      throw new Error(errorMessage);
    }
  }

  private getHeaders(accessToken: string): AxiosRequestConfig['headers'] {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    };
  }
}
