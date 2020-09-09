import { createApiClient } from 'ch-sdk-node';
import { CreatePaymentRequest } from 'ch-sdk-node/dist/services/payment'


import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { CONFIRMATION_PAGE_URI } from '../routes/paths';

export class PaymentService {

  private readonly redirectUrl: string;
  private readonly paymentApiUrl: string;
  private readonly suppressionApiUrl: string;

  public constructor() {
    const serviceURL = getConfigValue('CHS_URL');
    this.redirectUrl = `${serviceURL}${CONFIRMATION_PAGE_URI}`;
    this.paymentApiUrl = getConfigValue('PAYMENTS_API_URL') as string
    this.suppressionApiUrl = getConfigValue('SUPPRESSION_API_URL') as string
  }

  public async initPayment(suppressionID: string, paymentStateUUID: string, token: string): Promise<string> {

    const api = createApiClient(undefined, token, this.paymentApiUrl);
    const resourceUrl = `${this.suppressionApiUrl}/suppressions/${suppressionID}/payment`

    const body: CreatePaymentRequest = {
      redirectUri: this.redirectUrl,
      reference: suppressionID,
      resource: resourceUrl,
      state: paymentStateUUID
    };

    const response = await api.payment.createPayment(body)
    if (response.isFailure()) {
      const status = response.value.httpStatusCode
      const error = response.value.errors;
      throw new Error(`Failed to create payment: ${status} - ${error}`);
    } else {
      return response.value.resource!.links.journey;
    }
  }
}
