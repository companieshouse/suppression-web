export const SUPPRESSION_DATA_KEY: string = 'suppression';

export interface SuppressionSession {
  applicationReference?: string;
  paymentDetails?: PaymentDetails
}

export interface PaymentDetails {
  stateUUID: string;
  resourceUri: string;
}
