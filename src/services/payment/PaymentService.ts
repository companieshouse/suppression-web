import { createApiClient } from 'ch-sdk-node';
import ApiClient from 'ch-sdk-node/dist/client';
import { CreatePaymentRequest, Payment } from 'ch-sdk-node/dist/services/payment';
import { ApiResponse, ApiResult } from 'ch-sdk-node/dist/services/resource';

import { PaymentStatus } from '../../models/PaymentStatus';
import { getConfigValue } from '../../modules/config-handler/ConfigHandler';
import { PAYMENT_CALLBACK_URI } from '../../routes/paths';

export class PaymentService {

  private readonly redirectUrl: string;
  private readonly paymentApiUrl: string;
  private readonly suppressionApiUrl: string;

  public constructor() {
    const serviceURL = getConfigValue('CHS_URL');
    this.redirectUrl = `${serviceURL}${PAYMENT_CALLBACK_URI}`;
    this.paymentApiUrl = getConfigValue('PAYMENTS_API_URL') as string
    this.suppressionApiUrl = getConfigValue('SUPPRESSIONS_API_URL') as string
  }

  public async generatePaymentUrl(applicationReference: string, paymentStateUUID: string, token: string): Promise<PaymentResource> {

    const apiClient: ApiClient = createApiClient(undefined, token, this.paymentApiUrl);

    console.log(`${PaymentService.name} - Making a POST request to ${this.paymentApiUrl}/payments`);

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
      return Promise.reject(
        new Error(`Failed to initiate payment - status: ${errorResponse.httpStatusCode}, error: ${errorResponse.errors}`))
    }
    console.log(`${PaymentService.name} - Created payment URL - ${response.value.resource!.links.journey}`);
    return {
      redirectUrl: `${response.value.resource!.links.journey}?summary=false`,
      resourceUri: `${response.value.resource!.links.self}`
    };
  }

  public async getPaymentStatus(paymentResource: string, token: string): Promise<PaymentStatus> {
    const apiClient: ApiClient = createApiClient(undefined, token, this.paymentApiUrl);

    console.log(`${PaymentService.name} - Making a GET request to ${this.paymentApiUrl}/payments`);

    const response: ApiResult<ApiResponse<Payment>> = await apiClient.payment.getPayment(paymentResource);

    if (response.isFailure()) {
      const errorResponse = response.value;
      return Promise.reject(
        new Error(`Failed to verify payment status - status: ${errorResponse.httpStatusCode}, error: ${errorResponse.errors}`));
    }

    const paymentStatus = response.value.resource!.status as PaymentStatus;
    console.log(`${PaymentService.name} - Retrieved payment status - ${paymentStatus}`);
    return paymentStatus;
  }
}

export interface PaymentResource {
  redirectUrl: string;
  resourceUri: string;
}
