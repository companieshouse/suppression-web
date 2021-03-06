import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { ApplicantDetails, SuppressionData } from '../../src/models/SuppressionDataModel';
import { SuppressionSession } from '../../src/models/SuppressionSessionModel';
import {
  ADDRESS_TO_REMOVE_PAGE_URI,
  APPLICANT_DETAILS_PAGE_URI,
  ROOT_URI
} from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService';
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveErrorMessages,
  expectToHaveErrorSummaryContaining,
  expectToHaveInput,
  expectToHavePopulatedInput,
  expectToHaveTitle, expectToHaveTitleWithError
} from '../HtmlPatternAssertions';
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');

describe('ApplicantDetailsController', () => {

  const pageTitle = 'What are the applicant’s details\\?';
  const app = createApp();

  describe('on GET', () => {

    it('should render error when suppression service throws exception', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        throw Error('')
      });

      await request(app)
        .get(APPLICANT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should throw an error if get suppression service throws exception', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return {applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementation(() => {
        throw new Error('mocking error')
      });

      await request(app)
        .get(APPLICANT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should return 200 and render the Applicant Details Page', async () => {
      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => {
        return Promise.resolve({} as SuppressionData)
      });

      await request(app).get(APPLICANT_DETAILS_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.OK);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveInput(response.text, 'fullName', 'Full name');
        expect(response.text).toContain('Has the applicant used a different name on the Companies House register in the last 20 years?');
        expectToHaveInput(response.text, 'day', 'Day');
        expectToHaveInput(response.text, 'month', 'Month');
        expectToHaveInput(response.text, 'year', 'Year');
      });
    });

    it('should return 200 with pre-populated data when accessing page with a valid suppression ID in session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => Promise.resolve(generateTestData()));

      const applicantDetails: ApplicantDetails = generateTestData().applicantDetails;

      await request(app)
        .get(APPLICANT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHavePopulatedInput(response.text, 'fullName', applicantDetails.fullName);
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
        day: '01',
        month: '01',
        year: '2020'
      };
    }

    afterEach(() => {
      jest.clearAllMocks()
    });

    jest.spyOn(SuppressionService.prototype, 'save').mockImplementation(() => Promise.resolve('12345-12345'));

    jest.spyOn(SuppressionService.prototype, 'patch').mockImplementation(() => Promise.resolve());

    const fullNameErrorMessage = 'Enter the applicant’s full name';
    const hasPreviousNameMissingMessage = 'Select yes if the applicant has used a different name on the Companies house register in the last 20 years';
    const previousNameMissingMessage = 'Enter previous full name';
    const missingDateOfBirthErrorMessage: string = 'Enter the applicant’s date of birth';
    const missingYearErrorMessage: string = 'You must enter a year';
    const invalidDateErrorMessage: string = 'Enter a real date';

    it('should show three validation errors if no information is entered', async () => {

      await request(app).post(APPLICANT_DETAILS_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitleWithError(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveErrorSummaryContaining(response.text, [
          fullNameErrorMessage,
          hasPreviousNameMissingMessage,
          missingDateOfBirthErrorMessage
        ]);
        expectToHaveErrorMessages(response.text, [
          fullNameErrorMessage,
          hasPreviousNameMissingMessage,
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
        expectToHaveTitleWithError(response.text, pageTitle);
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
          expectToHaveTitleWithError(response.text, pageTitle);
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
          expectToHaveTitleWithError(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [previousNameMissingMessage]);
          expectToHaveErrorMessages(response.text, [previousNameMissingMessage]);
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
          expectToHaveTitleWithError(response.text, pageTitle);
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
          expectToHaveTitleWithError(response.text, pageTitle);
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
          expectToHaveTitleWithError(response.text, pageTitle);
          expectToHaveBackButton(response.text, ROOT_URI);
          expectToHaveErrorSummaryContaining(response.text, [invalidDateErrorMessage]);
          expectToHaveErrorMessages(response.text, [invalidDateErrorMessage]);
        });
    });

    it('should redirect to the next page if the information provided by the user is valid with previous session (yes to previousNames)', async () => {
      const testData = generateData();

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return {applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementationOnce(() => Promise.resolve());

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(SuppressionService.prototype.save).not.toHaveBeenCalled();
          expect(SuppressionService.prototype.patch).toHaveBeenCalled();
          expect(response.header.location).toContain(ADDRESS_TO_REMOVE_PAGE_URI);
        });
    });

    it('should redirect to the next page if the information provided by the user is valid with previous session (no to previousName)', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return {applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementationOnce(() => Promise.resolve());

      const testData = generateData();
      testData.hasPreviousName = 'no';
      delete testData.previousName;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(SuppressionService.prototype.save).not.toHaveBeenCalled();
          expect(SuppressionService.prototype.patch).toHaveBeenCalled();
          expect(response.header.location).toContain(ADDRESS_TO_REMOVE_PAGE_URI);
        });
    });

    it('should redirect to the next page if the information provided by the user is valid and no application reference is present', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any } as SuppressionSession
      });

      const testData = generateData();
      testData.hasPreviousName = 'no';
      delete testData.previousName;

      await request(app).post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(SuppressionService.prototype.save).toHaveBeenCalled();
          expect(SuppressionService.prototype.patch).not.toHaveBeenCalled();
          expect(response.header.location).toContain(ADDRESS_TO_REMOVE_PAGE_URI);
        });
    });

    it('should throw an error if patch suppression service throws exception', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return {applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementationOnce(() => {
        throw new Error('')
      });

      const testData = generateData();

      await request(app)
        .post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error if save suppression service throws exception', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any } as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('')
      });

      const testData = generateData();

      await request(app)
        .post(APPLICANT_DETAILS_PAGE_URI)
        .send(testData)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
