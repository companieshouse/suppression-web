export const SUPPRESSION_DATA_KEY: string = 'suppression';

export interface SuppressionData {
  applicantDetails: ApplicantDetails,
  addressToRemove: Address
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
