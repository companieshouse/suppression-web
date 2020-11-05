import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { ApplicantDetails, SuppressionData } from '../../models/SuppressionDataModel';
import { loggerInstance } from '../../utils/Logger';
import { RefreshTokenInterceptor } from '../RefreshTokenInterceptor';
import { SuppressionServiceError, SuppressionUnauthorisedError, SuppressionUnprocessableEntityError } from './errors';

export class SuppressionService {

  private readonly axiosInstance: AxiosInstance;
  private readonly refreshTokenInterceptor: RefreshTokenInterceptor;

  constructor(private readonly uri: string) {
    this.axiosInstance = axios.create();
    this.refreshTokenInterceptor = new RefreshTokenInterceptor(this.axiosInstance);
  }

  public async save(applicantDetails: ApplicantDetails, accessToken: string, refreshToken: string): Promise<string> {

    this.checkArgumentOrThrow(applicantDetails, 'applicant details data is missing');
    this.checkArgumentOrThrow(accessToken, 'Access token is missing');

    this.refreshTokenInterceptor.initialise(accessToken, refreshToken);

    const uri: string = `${this.uri}/suppressions`;

    loggerInstance().info(`${SuppressionService.name} - Making a POST request to ${uri}`);

    return await this.axiosInstance
      .post(uri, applicantDetails)
      .then((response: AxiosResponse<string>) => {
        if (response.status === StatusCodes.CREATED && response.headers.location) {
          return response.data.toString()
        }
        throw new Error('Could not create suppression resource');
      })
      .catch(this.handleResponseError('save'))
  }

  public async get(applicationReference: string, accessToken: string, refreshToken: string): Promise<SuppressionData> {

    this.checkArgumentOrThrow(applicationReference, 'Application reference is missing');
    this.checkArgumentOrThrow(accessToken, 'Access token is missing');

    this.refreshTokenInterceptor.initialise(accessToken, refreshToken);

    const uri: string = `${this.uri}/suppressions/${applicationReference}`;

    loggerInstance().info(`${SuppressionService.name} - Making a GET request to ${uri}`);

    return await this.axiosInstance
      .get(uri)
      .then((response: AxiosResponse<SuppressionData>) => {
        if (response.status === StatusCodes.OK) {
          return response.data
        }
        throw new Error('Could not retrieve suppression resource');
      })
      .catch(this.handleResponseError('get'))
  }

  public async patch(partialSuppression: any, applicationReference: string, accessToken: string, refreshToken: string): Promise<void> {

    this.checkArgumentOrThrow(partialSuppression, 'Partial suppression data is missing');
    this.checkArgumentOrThrow(applicationReference, 'Application reference is missing');
    this.checkArgumentOrThrow(accessToken, 'Access token is missing');

    this.refreshTokenInterceptor.initialise(accessToken, refreshToken);

    const uri: string = `${this.uri}/suppressions/${applicationReference}`;

    loggerInstance().info(`${SuppressionService.name} - Making a PATCH request to ${uri}`);

    return await this.axiosInstance
      .patch(uri, partialSuppression as SuppressionData)
      .then((response: AxiosResponse<void>) => {
        if (response.status === StatusCodes.NO_CONTENT) {
          return;
        }
      })
      .catch(this.handleResponseError('patch'))
  }

  private handleResponseError(operation: 'save' | 'get' | 'patch'): (_: AxiosError) => never {
    return (err: AxiosError) => {
      if (err.response) {
        switch (err.response.status) {
          case StatusCodes.UNAUTHORIZED:
            throw new SuppressionUnauthorisedError(`${operation} suppression unauthorised`);
          case StatusCodes.UNPROCESSABLE_ENTITY:
            throw new SuppressionUnprocessableEntityError(`${operation} suppression on invalid suppression data`);
          case StatusCodes.NOT_FOUND:
            throw new Error(`${operation} suppression failed. Suppression not found`);
        }
      }

      throw new SuppressionServiceError(`${operation} suppression failed with message: ${err.message || 'unknown error'}`);
    };
  }

  private checkArgumentOrThrow<T>(arg: T, errorMessage: string): void {
    if (arg == null) {
      throw new Error(errorMessage);
    }
  }
}
