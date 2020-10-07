import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { ApplicantDetails, SuppressionData } from '../../src/models/SuppressionDataModel';
import { SuppressionSession } from '../../src/models/suppressionSessionModel';
import { ADDRESS_TO_REMOVE_PAGE_URI, APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService';
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveErrorMessages,
  expectToHaveErrorSummaryContaining,
  expectToHaveInput,
  expectToHavePopulatedInput,
  expectToHaveTitle
} from '../HtmlPatternAssertions';
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');

describe('ApplicantDetailsController', () => {

  const pageTitle = 'Applicant’s Details';
  const app = createApp();

  describe('on GET', () => {

    it('should return 200 and render the Applicant Details Page', async () => {
      await request(app).get(APPLICANT_DETAILS_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.OK);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveInput(response.text, 'fullName', 'Full name');
        expect(response.text).toContain('Has the applicant used a different name on the Companies House register in the last 20 years?');
        expectToHaveInput(response.text, 'emailAddress', 'Email address');
        expectToHaveInput(response.text, 'day', 'Day');
        expectToHaveInput(response.text, 'month', 'Month');
        expectToHaveInput(response.text, 'year', 'Year');
      });
    });

    it('should return 200 with pre-populated data when accessing page with a session', async () => {
      const applicantDetails: ApplicantDetails = generateTestData().applicantDetails;

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementation(() => {
        return Promise.resolve(generateTestData())
      });

      jest.spyOn(SessionService, 'getSession').mockImplementation(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      await request(app)
        .get(APPLICANT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHavePopulatedInput(response.text, 'fullName', applicantDetails.fullName);
          expectToHavePopulatedInput(response.text, 'emailAddress', applicantDetails.emailAddress);
          expectToHavePopulatedInput(response.text, 'previousName', applicantDetails.previousName!);
          expectToHavePopulatedInput(response.text, 'day', '01');
          expectToHavePopulatedInput(response.text, 'month', '05');
          expectToHavePopulatedInput(response.text, 'year', '1980');
        });
    });

  });

  describe('on POST', () => {

    function generateData(): any {
      return {
        fullName: 'John Doe',
        hasPreviousName: 'yes',
        previousName: 'test_name',
        emailAddress: 'test@example.com',
        day: '01',
        month: '01',
        year: '2020'
      };
    }

    jest.spyOn(SuppressionService.prototype, 'save').mockImplementation(() => {
      return Promise.resolve('12345-12345')
    });

    const fullNameErrorMessage = 'Full name is required';
    const hasPreviousNameMissingMessage = 'Select yes if the applicant has used a different name for business purposes in the last 20 years';
    const previousNameMissingMessage = 'Enter previous full names, used for business purposes';
    const emailMissingErrorMessage = 'Email address is required';
    const emailInvalidErrorMessage = 'Enter an email address in the correct format, like name@example.com';
    const missingDateOfBirthErrorMessage: string = 'Date of birth is required';
    const missingYearErrorMessage: string = 'You must enter a year';
    const invalidDateErrorMessage: string = 'Enter a real date';

    it('should show four validation errors if no information is entered', async () => {

      await request(app).post(APPLICANT_DETAILS_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveErrorSummaryContaining(response.text, [
          fullNameErrorMessage,
          hasPreviousNameMissingMessage,
          emailMissingErrorMessage,
          missingDateOfBirthErrorMessage
        ]);
        expectToHaveErrorMessages(response.text, [
          fullNameErrorMessage,
          hasPreviousNameMissingMessage,
          emailMissingErrorMessage,
          missingDateOfBirthErrorMessage
        ]);
      });
    });

    it('should show a validation error if no name is entered', async () => {
      const testData = generateData();
      delete testData.fullName;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveErrorSummaryContaining(response.text, [fullNameErrorMessage]);
        expectToHaveErrorMessages(response.text, [fullNameErrorMessage]);
      });
    });

    it('should show a validation error if no hasPreviousName option entered', async () => {
      const testData = generateData();
      delete testData.hasPreviousName;
      delete testData.previousName;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [hasPreviousNameMissingMessage]);
          expectToHaveErrorMessages(response.text, [hasPreviousNameMissingMessage]);
        });
    });

    it('should show a validation error if hasPreviousName option is yes, but no name entered', async () => {
      const testData = generateData();
      delete testData.previousName;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [previousNameMissingMessage]);
          expectToHaveErrorMessages(response.text, [previousNameMissingMessage]);
        });
    });

    it('should show a validation error if no email address is entered', async () => {
      const testData = generateData();
      delete testData.emailAddress;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [emailMissingErrorMessage]);
          expectToHaveErrorMessages(response.text, [emailMissingErrorMessage]);
        });
    });

    it('should show a validation error if the email address entered is invalid', async () => {
      const testData = generateData();
      testData.emailAddress = 'test.com';

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [emailInvalidErrorMessage]);
          expectToHaveErrorMessages(response.text, [emailInvalidErrorMessage]);
        });
    });

    it('should show a validation error if the date of birth is entirely missing', async () => {
      const testData = generateData();
      delete testData.day;
      delete testData.month;
      delete testData.year;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [missingDateOfBirthErrorMessage]);
          expectToHaveErrorMessages(response.text, [missingDateOfBirthErrorMessage]);
        });
    });

    it('should show a validation error if a component of the date of birth is missing', async () => {
      const testData = generateData();
      delete testData.year;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [missingYearErrorMessage]);
          expectToHaveErrorMessages(response.text, [missingYearErrorMessage]);
        });
    });

    it('should show a validation error if the date of birth is invalid', async () => {
      const testData = generateData();
      testData.day = '34';

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [invalidDateErrorMessage]);
          expectToHaveErrorMessages(response.text, [invalidDateErrorMessage]);
        });
    });

    it('should redirect to the next page if the information provided by the user is valid (yes to previousNames)', async () => {
      const testData = generateData();

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toContain(ADDRESS_TO_REMOVE_PAGE_URI);
        });
    });

    it('should redirect to the next page if the information provided by the user is valid (no to previousName)', async () => {
      const testData = generateData();
      testData.hasPreviousName = 'no';
      delete testData.previousName;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toContain(ADDRESS_TO_REMOVE_PAGE_URI);
        });
    });
  });
});
