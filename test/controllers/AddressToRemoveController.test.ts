import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { Address, SuppressionData } from '../../src/models/SuppressionDataModel'
import { ADDRESS_TO_REMOVE_PAGE_URI, APPLICANT_DETAILS_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI } from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService'
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveErrorMessages,
  expectToHaveErrorSummaryContaining,
  expectToHaveInput,
  expectToHavePopulatedInput,
  expectToHaveTitle
} from '../HtmlPatternAssertions'

jest.mock('../../src/services/session/SessionService');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AddressToRemoveController', () => {

  const pageTitle = 'Address details';
  const app = createApp();

  describe('on GET', () => {

    it('should return 200 and render the Address to Remove Page', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => {
        return {
          applicantDetails: {
            fullName: 'test-name',
            emailAddress: 'test-email'
          }
        } as SuppressionData
      });

      await request(app).get(ADDRESS_TO_REMOVE_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.OK);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveInput(
          response.text,
          'line1',
          'Building and street <span class=\"govuk-visually-hidden\">line 1 of 2</span>');
        expectToHaveInput(
          response.text,
          'line2',
          '<span class=\"govuk-visually-hidden\">Building and street line 2 of 2</span>');
        expectToHaveInput(response.text, 'town', 'Town or city');
        expectToHaveInput(response.text, 'county', 'County');
        expectToHaveInput(response.text, 'postcode', 'Postcode');
        expectToHaveInput(response.text, 'country', 'Country')
      });
    });

    it('should prepopulate fields when relevent data is found in the session', async () => {
      await request(app).get(ADDRESS_TO_REMOVE_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.OK);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHavePopulatedInput(response.text, 'line1', '1 Test Street');
        expectToHavePopulatedInput(response.text, 'town', 'Test Town');
        expectToHavePopulatedInput(response.text, 'county', 'Test Midlands');
        expectToHavePopulatedInput(response.text, 'postcode', 'TE10 6ST');
        expectToHavePopulatedInput(response.text, 'country', 'United Kingdom');
      });
    });

  });

  describe('on POST', () => {

    const addressLine1ErrorMessage = 'Building and street is required';
    const townOrCityErrorMessage = 'Town or city is required';
    const countyErrorMessage = 'County is required';
    const postcodeErrorMessage = 'Postcode is required';
    const countryErrorMessage = 'Country is required';

    function generateTestData(): Address {
      return {
        line1: '1 Main Street',
        line2: 'Selly Oak',
        town: 'Cardiff',
        county: 'Cardiff',
        postcode: 'CF14 3UZ',
        country: 'United Kingdom'
      }
    }

    it('should throw an error if the session doesn’t exist', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => undefined);

      await request(app)
        .post(ADDRESS_TO_REMOVE_PAGE_URI)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should show four validation errors if no information is entered', async () => {

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [
          addressLine1ErrorMessage, townOrCityErrorMessage, countyErrorMessage, postcodeErrorMessage, countryErrorMessage
        ]);
        expectToHaveErrorMessages(response.text, [
          addressLine1ErrorMessage, townOrCityErrorMessage, countyErrorMessage, postcodeErrorMessage, countryErrorMessage
        ]);
      });
    });

    it('should show a validation error message if Address Line 1 is not provided', async () => {

      const testData = generateTestData();
      testData.line1 = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [addressLine1ErrorMessage]);
        expectToHaveErrorMessages(response.text, [addressLine1ErrorMessage]);
      })
    });

    it('should show a validation error message if Town or City is not provided', async () => {

      const testData = generateTestData();
      testData.town = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [townOrCityErrorMessage]);
        expectToHaveErrorMessages(response.text, [townOrCityErrorMessage]);
      })
    });

    it('should show a validation error message if County is not provided', async () => {

      const testData = generateTestData();
      testData.county = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [countyErrorMessage]);
        expectToHaveErrorMessages(response.text, [countyErrorMessage]);
      })
    });

    it('should show a validation error message if Postcode is not provided', async () => {

      const testData = generateTestData();
      testData.postcode = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [postcodeErrorMessage]);
        expectToHaveErrorMessages(response.text, [postcodeErrorMessage]);
      })
    });

    it('should show a validation error message if Country is not provided', async () => {

      const testData = generateTestData();
      testData.country = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [countryErrorMessage]);
        expectToHaveErrorMessages(response.text, [countryErrorMessage]);
      })
    });

    it('should accept address details without data for Address Line 2, and redirect to the Document Details page', async () => {

      const testData = generateTestData();
      testData.line2 = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toContain(DOCUMENT_DETAILS_PAGE_URI);
      });
    });

    it('should redirect to the Document Details page if the information provided by the user is valid', async () => {

      const testData = generateTestData();

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toContain(DOCUMENT_DETAILS_PAGE_URI);
      });
    });

  });
});
