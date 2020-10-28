export const SUPPRESSION_DATA_KEY: string = 'suppression';

export interface SuppressionSession {
  applicationReference: string;
  navigationPermissions: string [];
  paymentDetails?: PaymentDetails;
  previousApplicationReference?: string;
}

export interface PaymentDetails {
  stateUUID: string;
  resourceUri: string;
}
