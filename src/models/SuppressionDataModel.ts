export const SUPPRESSION_DATA_KEY: string = 'suppression';

export interface SuppressionData {
  applicationReference?: string
  applicantDetails: ApplicantDetails,
  addressToRemove: Address,
  documentDetails: DocumentDetails
}

export interface ApplicantDetails {
  fullName: string,
  emailAddress: string
}

export interface Address {
  line1: string,
  line2?: string,
  town: string,
  county: string,
  postcode: string
}

export interface DocumentDetails {
  companyName: string;
  companyNumber: string;
  description: string;
  date: string;
}
