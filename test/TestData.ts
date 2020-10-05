import {
  Address,
  ApplicantDetails,
  DocumentDetails,
  PaymentDetails,
  SuppressionData
} from '../src/models/SuppressionDataModel';

export function generateTestData(): SuppressionData {
  return {
    applicantDetails: {
      fullName: 'John Doe',
      previousName: 'Jane Doe',
      emailAddress: 'test@example.com',
      dateOfBirth: '1980-05-01'
    } as ApplicantDetails,
    addressToRemove: {
      line1: '1 Residential Avenue',
      line2: 'Selly Oak',
      town: 'Birmingham',
      county: 'West Midlands',
      postcode: 'B29 4TD',
      country: 'United Kingdom'
    } as Address,
    documentDetails: {
      companyName: 'company-name-test',
      companyNumber: 'NI000000',
      description: 'This is a document',
      date: '2020-01-01'
    } as DocumentDetails,
    serviceAddress: {
      line1: '1 Main Street',
      line2: 'Splott',
      town: 'Cardiff',
      county: 'Cardiff',
      postcode: 'CF14 3UZ',
      country: 'United Kingdom'
    } as Address,
    contactAddress: {
      line1: '1st Avenue',
      town: 'New York',
      county: 'New York',
      postcode: 'NY',
      country: 'USA'
    } as Address,
    paymentDetails: {
      stateUUID: 'asdfghjkl',
      status: 'created',
      resourceUri: 'paments/TEST12345678'
    } as PaymentDetails,
    applicationReference: 'TEST-TEST'
  } as SuppressionData;
}
