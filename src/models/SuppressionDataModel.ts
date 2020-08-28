export const SUPPRESSION_DATA_KEY: string = 'suppression';

export interface SuppressionData {
  applicantDetails?: ApplicantDetails,
  documentDetails?: DocumentDetails
}

export interface ApplicantDetails {
  fullName: string,
  emailAddress: string
}

export interface DocumentDetails {
  companyName: string;
  companyNumber: string;
  description: string;
  date: string;
}
