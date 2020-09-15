import { createApiClient } from 'ch-sdk-node';
import ApiClient from 'ch-sdk-node/dist/client';
import { CreatePaymentRequest, Payment } from 'ch-sdk-node/dist/services/payment'
import { ApiResponse } from 'ch-sdk-node/dist/services/resource';
import { ApiResult } from 'ch-sdk-node/src/services/resource';

import { getConfigValue } from '../../modules/config-handler/ConfigHandler';
import { CONFIRMATION_PAGE_URI } from '../../routes/paths';

export class PaymentService {

  private readonly redirectUrl: string;
  private readonly paymentApiUrl: string;
  private readonly suppressionApiUrl: string;

  public constructor() {
    const serviceURL = getConfigValue('CHS_URL');
    this.redirectUrl = `${serviceURL}${CONFIRMATION_PAGE_URI}`;
    this.paymentApiUrl = getConfigValue('PAYMENTS_API_URL') as string
    this.suppressionApiUrl = getConfigValue('SUPPRESSIONS_API_URL') as string
  }

  public async initPayment(applicationReference: string, paymentStateUUID: string, token: string): Promise<string> {

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
        new Error(`Failed to initiate payment, status: ${errorResponse.httpStatusCode}, error: ${errorResponse.errors}`))
    }
    console.log(`${PaymentService.name} - Created payment URL - ${response.value.resource!.links.journey}`);
    return `${response.value.resource!.links.journey}?summary=false`;
  }
}
