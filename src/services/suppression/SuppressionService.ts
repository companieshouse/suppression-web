import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes/build';
import { ApplicantDetails, DocumentDetails, SuppressionData } from '../../models/SuppressionDataModel';
import { SuppressionServiceError, SuppressionUnauthorisedError, SuppressionUnprocessableEntityError } from './errors';

export class SuppressionService {

  constructor(private readonly uri: string) {
    this.uri = uri;
  }

  public async save(suppression: SuppressionData, accessToken: string): Promise<string> {

    this.checkArgumentOrThrow(suppression, 'Suppression data is missing');
    this.checkArgumentOrThrow(accessToken, 'Access token is missing');

    const uri: string = `${this.uri}/suppressions`;

    console.log(`${SuppressionService.name} - Making a POST request to ${uri}`);

    return await axios
      .post(uri, suppression, {headers: this.getHeaders(accessToken)})
      .then((response: AxiosResponse<string>) => {
        if (response.status === StatusCodes.CREATED && response.headers.location) {
          console.log(`${SuppressionService.name} - save: created resource ${response.data} - ${response.headers.location}`);
          return response.data.toString()
        }
        throw new Error('Could not create suppression resource');
      })
      .catch(this.handleResponseError('save'))
  }

  public async get(applicationReference: string, accessToken: string): Promise<SuppressionData> {

    this.checkArgumentOrThrow(applicationReference, 'Application reference is missing');
    this.checkArgumentOrThrow(accessToken, 'Access token is missing');

    const uri: string = `${this.uri}/${applicationReference}`;

    console.log(`${SuppressionService.name} - Making a GET request to ${uri}`);

    return await axios
      .get(uri, {headers: this.getHeaders(accessToken)})
      .then((response: AxiosResponse<SuppressionData>) => {
        if (response.status === StatusCodes.OK && response.headers.location) {
          console.log(`${SuppressionService.name} - get: retrieved resource ${response.data} - ${response.headers.location}`);
          return response.data
        }
        throw new Error('Could not retrieve suppression resource');
      })
      .catch(this.handleResponseError('get'))
  }

  public async partiallyUpdate(partialSuppression: any, applicationReference: string, accessToken: string): Promise<boolean> {

    this.checkArgumentOrThrow(partialSuppression, 'Partial suppression data is missing');
    this.checkArgumentOrThrow(applicationReference, 'Application reference is missing');
    this.checkArgumentOrThrow(accessToken, 'Access token is missing');

    const uri: string = `${this.uri}/${applicationReference}`;

    console.log(`${SuppressionService.name} - Making a PATCH request to ${uri}`);

    return await axios
      .patch(uri, partialSuppression as SuppressionData, {headers: this.getHeaders(accessToken)})
      .then((response: AxiosResponse<boolean>) => {
        if (response.status === StatusCodes.NO_CONTENT && response.headers.location) {
          console.log(`${SuppressionService.name} - partially update: updated resource ${response.data} - ${response.headers.location}`);
          return true;
        }
        throw new Error('Could not update suppression resource');
      })
      .catch(this.handleResponseError('partially update'))
  }

  private handleResponseError(operation: 'save' | 'get' | 'partially update'): (_: AxiosError) => never {
    return (err: AxiosError) => {

      if (err.response != null) {
        switch (err.response.status) {
          case StatusCodes.UNAUTHORIZED:
            throw new SuppressionUnauthorisedError(`${operation} suppression unauthorised`);
          case StatusCodes.UNPROCESSABLE_ENTITY:
            throw new SuppressionUnprocessableEntityError(`${operation} suppression on invalid suppression data`);
          case StatusCodes.NOT_FOUND:
            throw new Error(`${operation} suppression failed. API not found`);
        }
      }

      throw new SuppressionServiceError(`${operation} suppression failed with message: ${err.message || 'unknown error'}`);
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
