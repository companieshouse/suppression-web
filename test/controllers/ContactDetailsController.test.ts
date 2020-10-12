import { StatusCodes } from 'http-status-codes/build';
import request from 'supertest';
import { SuppressionSession } from '../../src/models/suppressionSessionModel';
import {
  CHECK_SUBMISSION_PAGE_URI,
  CONTACT_DETAILS_PAGE_URI,
  SERVICE_ADDRESS_PAGE_URI
} from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService';
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveErrorMessages,
  expectToHaveErrorSummaryContaining,
  expectToHaveInput, expectToHavePopulatedInput,
  expectToHaveTitle
} from '../HtmlPatternAssertions';
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ContactDetailsController', () => {

  const pageTitle = 'What are your contact details\\?';
  const app = createApp();

  describe('on GET', () => {

    it('should return 200 and render the Contact Details page', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: ''} as SuppressionSession
      });

      await request(app)
        .get(CONTACT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, SERVICE_ADDRESS_PAGE_URI);
          expectToHaveInput(response.text, 'line1',
            'Building and street <span class=\"govuk-visually-hidden\">line 1 of 2</span>');
          expectToHaveInput(response.text, 'line2',
            '<span class=\"govuk-visually-hidden\">Building and street line 2 of 2</span>');
          expectToHaveInput(response.text, 'town', 'Town or city');
          expectToHaveInput(response.text, 'county', 'County');
          expectToHaveInput(response.text, 'postcode', 'Postcode');
          expectToHaveInput(response.text, 'country', 'Country');
        });
    });

    it('should render error when no session present ', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return undefined
      });

      await request(app)
        .get(CONTACT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });

    })

    it('should return 200 with pre-populated data when accessing page with a session', async () => {

      const testData = generateTestData();

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => {
        return Promise.resolve(testData)
      });

      await request(app)
        .get(CONTACT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, SERVICE_ADDRESS_PAGE_URI);
          expectToHavePopulatedInput(response.text, 'line1', testData.contactAddress.line1);
          expectToHavePopulatedInput(response.text, 'town', testData.contactAddress.town);
          expectToHavePopulatedInput(response.text, 'county', testData.contactAddress.county);
          expectToHavePopulatedInput(response.text, 'postcode', testData.contactAddress.postcode);
          expectToHavePopulatedInput(response.text, 'country', testData.contactAddress.country);
        });
    });
  });

  describe('on POST', () => {

    const addressLine1ErrorMessage = 'Building and street is required';
    const townOrCityErrorMessage = 'Town or city is required';
    const countyErrorMessage = 'County is required';
    const postcodeErrorMessage = 'Postcode is required';
    const countryErrorMessage = 'Country is required';

    it('should throw an error if the session doesn’t exist', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return undefined
      });

      await request(app)
        .post(CONTACT_DETAILS_PAGE_URI)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should show four validation errors if no information is entered', async () => {

      await request(app).post(CONTACT_DETAILS_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, SERVICE_ADDRESS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [
          addressLine1ErrorMessage, townOrCityErrorMessage, countyErrorMessage, postcodeErrorMessage, countryErrorMessage
        ]);
        expectToHaveErrorMessages(response.text, [
          addressLine1ErrorMessage, townOrCityErrorMessage, countyErrorMessage, postcodeErrorMessage, countryErrorMessage
        ]);
      });
    });

    it('should show a validation error message if Address Line 1 is not provided', async () => {

      const testData = generateTestData().contactAddress;
      testData.line1 = '';

      await request(app).post(CONTACT_DETAILS_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, SERVICE_ADDRESS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [addressLine1ErrorMessage]);
        expectToHaveErrorMessages(response.text, [addressLine1ErrorMessage]);
      })
    });

    it('should show a validation error message if Town or City is not provided', async () => {

      const testData = generateTestData().contactAddress;
      testData.town = '';

      await request(app).post(CONTACT_DETAILS_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, SERVICE_ADDRESS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [townOrCityErrorMessage]);
        expectToHaveErrorMessages(response.text, [townOrCityErrorMessage]);
      })
    });

    it('should show a validation error message if County is not provided', async () => {

      const testData = generateTestData().contactAddress;
      testData.county = '';

      await request(app).post(CONTACT_DETAILS_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, SERVICE_ADDRESS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [countyErrorMessage]);
        expectToHaveErrorMessages(response.text, [countyErrorMessage]);
      })
    });

    it('should show a validation error message if Postcode is not provided', async () => {

      const testData = generateTestData().contactAddress;
      testData.postcode = '';

      await request(app).post(CONTACT_DETAILS_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, SERVICE_ADDRESS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [postcodeErrorMessage]);
        expectToHaveErrorMessages(response.text, [postcodeErrorMessage]);
      })
    });

    it('should show a validation error message if Country is not provided', async () => {

      const testData = generateTestData().contactAddress;
      testData.country = '';

      await request(app).post(CONTACT_DETAILS_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, SERVICE_ADDRESS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [countryErrorMessage]);
        expectToHaveErrorMessages(response.text, [countryErrorMessage]);
      })
    });

    it('should accept address details without data for Address Line 2, and redirect', async () => {

      jest.spyOn(SuppressionService.prototype, 'save').mockImplementationOnce(() => {
        return Promise.resolve('12345-12345')
      });

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementationOnce(() => {
        return Promise.resolve(true)
      });

      const testData = generateTestData().contactAddress;
      testData.line2 = '';

      await request(app).post(CONTACT_DETAILS_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toContain(CHECK_SUBMISSION_PAGE_URI);
      });
    });

    it('should redirect if the information provided by the user is valid', async () => {

      jest.spyOn(SuppressionService.prototype, 'save').mockImplementationOnce(() => {
        return Promise.resolve('12345-12345')
      });

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementationOnce(() => {
        return Promise.resolve(true)
      });

      const testData = generateTestData().contactAddress;

      await request(app).post(CONTACT_DETAILS_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toContain(CHECK_SUBMISSION_PAGE_URI);
      });
    });
  })
});
