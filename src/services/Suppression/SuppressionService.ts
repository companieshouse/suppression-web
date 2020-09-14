import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes/build';
import { SuppressionData } from '../../models/SuppressionDataModel';
import { SuppressionServiceError, SuppressionUnauthorisedError, SuppressionUnprocessableEntityError } from './errors';


export class SuppressionService {

  constructor(private readonly uri: string) {
    this.uri = uri;
  }

  public async save(suppression: SuppressionData, key: string): Promise<string> {

    this.checkArgumentOrThrow(suppression, 'Suppression data is missing');
    this.checkArgumentOrThrow(key, 'Key is missing');

    const uri: string = `${this.uri}/suppressions`;

    console.log(`${SuppressionService.name} - Making a POST request to ${uri}`);

    return await axios
      .post(uri, suppression, {headers: this.getHeaders(key)})
      .then((response: AxiosResponse<string>) => {
        if (response.status === StatusCodes.CREATED && response.headers.location) {
          console.log(`${SuppressionService.name} - save: created resource ${response.data} - ${response.headers.location}`);
          return response.data.toString()
        }
        throw new Error('Could not create suppression resource');
      })
      .catch(this.handleResponseError('save')
      )

  }

  private handleResponseError(operation: 'save'): (_: AxiosError) => never {
    return (err: AxiosError) => {

      if (err.response != null) {
        switch (err.response.status) {
          case StatusCodes.UNAUTHORIZED:
            throw new SuppressionUnauthorisedError(`${operation} suppression unauthorised`);
          case StatusCodes.UNPROCESSABLE_ENTITY:
            throw new SuppressionUnprocessableEntityError(`${operation} suppression on invalid appeal data`);
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

  private getHeaders(key: string): AxiosRequestConfig['headers'] {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': key
    };
  }
}
