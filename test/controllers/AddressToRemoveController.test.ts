import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { SuppressionData } from '../../src/models/SuppressionDataModel';

import { SuppressionSession } from '../../src/models/SuppressionSessionModel';
import { ADDRESS_TO_REMOVE_PAGE_URI, APPLICANT_DETAILS_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI } from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService'
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveErrorMessages,
  expectToHaveErrorSummaryContaining,
  expectToHaveInput,
  expectToHavePopulatedInput,
  expectToHaveTitle,
  expectToHaveTitleWithError
} from '../HtmlPatternAssertions'
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');

describe('AddressToRemoveController', () => {

  const pageTitle = 'What home address would you like to remove\\?';
  const app = createApp();

  describe('on GET', () => {

    jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => {
      return Promise.resolve({addressToRemove: undefined as any} as SuppressionData)
    });

    it('should return 200 and render the Address to Remove Page', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
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

    it('should render error when no session present ', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return undefined
      });

      await request(app)
        .get(ADDRESS_TO_REMOVE_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when no application reference in session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any} as SuppressionSession
      });

      await request(app)
        .get(ADDRESS_TO_REMOVE_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when suppression service throws exception', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        throw Error('')
      });

      await request(app)
        .get(ADDRESS_TO_REMOVE_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should throw an error if get suppression service throws exception', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return {applicationReference: '12345-12345' as any} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementation(() => {
        throw new Error('mocking error')
      });

      await request(app)
        .get(ADDRESS_TO_REMOVE_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should prepopulate fields when relevant data is found in the session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => {
        return Promise.resolve(generateTestData())
      });

      await request(app).get(ADDRESS_TO_REMOVE_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.OK);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHavePopulatedInput(response.text, 'line1', generateTestData().addressToRemove.line1);
        expectToHavePopulatedInput(response.text, 'town', generateTestData().addressToRemove.town);
        expectToHavePopulatedInput(response.text, 'county', generateTestData().addressToRemove.county);
        expectToHavePopulatedInput(response.text, 'postcode', generateTestData().addressToRemove.postcode);
        expectToHavePopulatedInput(response.text, 'country', generateTestData().addressToRemove.country);
      });
    });

  });

  describe('on POST', () => {

    const addressLine1ErrorMessage = 'Enter the building and street';
    const townOrCityErrorMessage = 'Enter the town or city';
    const countyErrorMessage = 'Enter the county';
    const postcodeErrorMessage = 'Enter the postcode';
    const countryErrorMessage = 'Enter the country';

    beforeEach(() => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });
    });

    jest.spyOn(SessionService, 'appendNavigationPermissions');

    it('should throw an error if the session doesn’t exist', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => undefined);

      const testData = generateTestData().addressToRemove;

      await request(app)
        .post(ADDRESS_TO_REMOVE_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    });

    it('should throw an error if application reference not in session', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any } as SuppressionSession
      });

      const testData = generateTestData().addressToRemove;

      await request(app)
        .post(ADDRESS_TO_REMOVE_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    });

    it('should throw an error if patch suppression service throws exception', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return {applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementation(() => {
        throw new Error('')
      });

      const testData = generateTestData().addressToRemove;

      await request(app)
        .post(ADDRESS_TO_REMOVE_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    });

    it('should show four validation errors if no information is entered', async () => {

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
        expectToHaveTitleWithError(response.text, pageTitle);
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

      const testData = generateTestData().addressToRemove;
      testData.line1 = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
        expectToHaveTitleWithError(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [addressLine1ErrorMessage]);
        expectToHaveErrorMessages(response.text, [addressLine1ErrorMessage]);
      })
    });

    it('should show a validation error message if Town or City is not provided', async () => {

      const testData = generateTestData().addressToRemove;
      testData.town = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
        expectToHaveTitleWithError(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [townOrCityErrorMessage]);
        expectToHaveErrorMessages(response.text, [townOrCityErrorMessage]);
      })
    });

    it('should show a validation error message if County is not provided', async () => {

      const testData = generateTestData().addressToRemove;
      testData.county = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
        expectToHaveTitleWithError(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [countyErrorMessage]);
        expectToHaveErrorMessages(response.text, [countyErrorMessage]);
      })
    });

    it('should show a validation error message if Postcode is not provided', async () => {

      const testData = generateTestData().addressToRemove;
      testData.postcode = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
        expectToHaveTitleWithError(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [postcodeErrorMessage]);
        expectToHaveErrorMessages(response.text, [postcodeErrorMessage]);
      })
    });

    it('should show a validation error message if Country is not provided', async () => {

      const testData = generateTestData().addressToRemove;
      testData.country = '';

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
        expectToHaveTitleWithError(response.text, pageTitle);
        expectToHaveBackButton(response.text, APPLICANT_DETAILS_PAGE_URI);
        expectToHaveErrorSummaryContaining(response.text, [countryErrorMessage]);
        expectToHaveErrorMessages(response.text, [countryErrorMessage]);
      })
    });

    it('should accept address details without data for Address Line 2, and redirect to the Document Details page', async () => {

      const testData = generateTestData().addressToRemove;
      testData.line2 = '';

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementation(() => {
        return Promise.resolve()
      });

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(SessionService.appendNavigationPermissions).toHaveBeenCalled();
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toContain(DOCUMENT_DETAILS_PAGE_URI);
      });
    });

    it('should redirect to the Document Details page if the information provided by the user is valid', async () => {

      const testData = generateTestData().addressToRemove;

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementation(() => {
        return Promise.resolve()
      });

      await request(app).post(ADDRESS_TO_REMOVE_PAGE_URI).send(testData).expect(response => {
        expect(SessionService.appendNavigationPermissions).toHaveBeenCalled();
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toContain(DOCUMENT_DETAILS_PAGE_URI);
      });
    });

  });
})
