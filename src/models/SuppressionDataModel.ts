import { PaymentStatus } from '../models/PaymentStatus';

export interface SuppressionData {
  applicationReference?: string;
  applicantDetails: ApplicantDetails;
  addressToRemove: Address;
  serviceAddress?: Address;
  documentDetails: DocumentDetails;
  contactAddress: Address;
}

export interface ApplicantDetails {
  fullName: string;
  previousName?: string;
  emailAddress: string;
  dateOfBirth: string;
}

export interface Address {
  line1: string;
  line2?: string;
  town: string;
  county: string;
  postcode: string;
  country: string;
}

export interface DocumentDetails {
  companyName: string;
  companyNumber: string;
  description: string;
  date: string;
}
