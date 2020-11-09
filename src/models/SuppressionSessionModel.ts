export const SUPPRESSION_DATA_KEY: string = 'suppression';

export interface SuppressionSession {
  applicationReference: string;
  navigationPermissions: string [];
  paymentDetails?: PaymentDetails;
  submittedApplicationReference?: string;
}

export interface PaymentDetails {
  stateUUID: string;
  resourceUri: string;
}
