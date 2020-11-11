import { createApiClient } from '@companieshouse/api-sdk-node';
import ApiClient from '@companieshouse/api-sdk-node/dist/client';
import { CreatePaymentRequest, Payment } from '@companieshouse/api-sdk-node/dist/services/payment';
import { ApiResponse, ApiResult } from '@companieshouse/api-sdk-node/dist/services/resource';

import { PaymentStatus } from '../../models/PaymentStatus';
import { getConfigValue } from '../../modules/config-handler/ConfigHandler';
import { PAYMENT_CALLBACK_URI } from '../../routes/paths';
import { loggerInstance } from '../../utils/Logger';
import { RefreshTokenService } from '../refresh-token/RefreshTokenService';

export class PaymentService {

  private readonly redirectUrl: string;
  private readonly paymentApiUrl: string;
  private readonly suppressionApiUrl: string;
  private readonly refreshTokenService: RefreshTokenService;
  private isRetry: boolean;

  public constructor(refreshTokenService: RefreshTokenService) {
    const serviceURL = getConfigValue('CHS_URL');
    this.redirectUrl = `${serviceURL}${PAYMENT_CALLBACK_URI}`;
    this.paymentApiUrl = getConfigValue('PAYMENTS_API_URL') as string;
    this.suppressionApiUrl = getConfigValue('SUPPRESSIONS_API_URL') as string;
    this.refreshTokenService = refreshTokenService;
  }

  public async generatePaymentUrl(applicationReference: string, paymentStateUUID: string, token: string, refreshToken: string): Promise<PaymentResource> {

    const apiClient: ApiClient = createApiClient(undefined, token, this.paymentApiUrl);

    loggerInstance().info(`${PaymentService.name} - Making a POST request to ${this.paymentApiUrl}/payments`);

    const paymentResourceUrl = `${this.suppressionApiUrl}/suppressions/${applicationReference}/payment`;

    const paymentRequest: CreatePaymentRequest = {
      redirectUri: this.redirectUrl,
      reference: applicationReference,
      resource: paymentResourceUrl,
      state: paymentStateUUID
    };

    const response: ApiResult<ApiResponse<Payment>> = await apiClient.payment.createPayment(paymentRequest);

    if (response.isFailure()) {
      const errorResponse = response.value;

      if (errorResponse.httpStatusCode === 401 && !this.isRetry) {
        this.isRetry = true;
        loggerInstance().info(`${PaymentService.name} - Payment API generate payment url request failed with: ${errorResponse.httpStatusCode}`
          + ' - Refreshing access token');
        const newAccessToken: string = await this.refreshTokenService.refresh(token, 'refreshToken');
        if (newAccessToken) {
          loggerInstance().info(`${PaymentService.name} - Access token successfully refreshed`);
          return this.generatePaymentUrl(applicationReference, paymentStateUUID, newAccessToken, refreshToken);
        }
      }

      return Promise.reject(
        new Error(`Failed to initiate payment - status: ${errorResponse.httpStatusCode}, error: ${errorResponse.errors}`))
    }

    loggerInstance().info(`${PaymentService.name} - Created payment URL - ${response.value.resource!.links.journey}`);
    return {
      redirectUrl: `${response.value.resource!.links.journey}?summary=false`,
      resourceUri: `${response.value.resource!.links.self}`
    };
  }

  public async getPaymentStatus(paymentResource: string, token: string, refreshToken: string): Promise<PaymentStatus> {
    const apiClient: ApiClient = createApiClient(undefined, token, this.paymentApiUrl);

    loggerInstance().info(`${PaymentService.name} - Making a GET request to ${this.paymentApiUrl}/payments`);

    const response: ApiResult<ApiResponse<Payment>> = await apiClient.payment.getPayment(paymentResource);

    if (response.isFailure()) {
      const errorResponse = response.value;

      if (errorResponse.httpStatusCode === 401 && !this.isRetry) {
        this.isRetry = true;
        loggerInstance().info(`${PaymentService.name} - Payment API get payment status request failed with: ${errorResponse.httpStatusCode}`
          + ' - Refreshing access token');
        const newAccessToken: string = await this.refreshTokenService.refresh(token, refreshToken);
        if (newAccessToken) {
          loggerInstance().info(`${PaymentService.name} - Access token successfully refreshed`);
          return this.getPaymentStatus(paymentResource, newAccessToken, refreshToken);
        }
      }

      return Promise.reject(
        new Error(`Failed to verify payment status - status: ${errorResponse.httpStatusCode}, error: ${errorResponse.errors}`));
    }

    const paymentStatus = response.value.resource!.status as PaymentStatus;
    loggerInstance().info(`${PaymentService.name} - Retrieved payment status - ${paymentStatus}`);
    return paymentStatus;
  }
}

export interface PaymentResource {
  redirectUrl: string;
  resourceUri: string;
}
