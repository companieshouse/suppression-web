export const SUPPRESSION_DATA_KEY: string = 'suppression';

export interface SuppressionData {
  applicantDetails: ApplicantDetails
}

export interface ApplicantDetails {
  fullName: string,
  emailAddress: string
}
