import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { Address, SuppressionData } from '../../src/models/SuppressionDataModel'
import {
  DOCUMENT_DETAILS_PAGE_URI,
  SERVICE_ADDRESS_PAGE_URI
} from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService'
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveInput,
  expectToHavePopulatedInput,
  expectToHaveTitle
} from '../HtmlPatternAssertions'

function generateTestData(): Address {
  return {
    line1: '1 Main Street',
    line2: 'Selly Oak',
    town: 'Cardiff',
    county: 'Cardiff',
    postcode: 'CF14 3UZ',
    country: 'UK'
  }
}

jest.mock('../../src/services/session/SessionService');

afterEach(() => {
  jest.restoreAllMocks();
})

describe('ServiceAddressController', () => {

  const pageTitle = 'Service address';

  describe('on GET', () => {

    it('should return 200 and render the Service Address Page', async () => {

      const app = createApp();

      await request(app)
        .get(SERVICE_ADDRESS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, DOCUMENT_DETAILS_PAGE_URI);
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
          expectToHaveInput(response.text, 'country', 'Country');
        });
    });

    it('should prepopulate fields when relevant data is found in the session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => {
        return {
          serviceAddress: generateTestData()
        } as SuppressionData
      });

      const app = createApp();

      await request(app)
        .get(SERVICE_ADDRESS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, DOCUMENT_DETAILS_PAGE_URI);
          expectToHavePopulatedInput(response.text, 'line1', '1 Main Street');
          expectToHavePopulatedInput(response.text, 'line2', 'Selly Oak');
          expectToHavePopulatedInput(response.text, 'town', 'Cardiff');
          expectToHavePopulatedInput(response.text, 'county', 'Cardiff');
          expectToHavePopulatedInput(response.text, 'postcode', 'CF14 3UZ');
          expectToHavePopulatedInput(response.text, 'country', 'UK');
        });
    });

  });

  describe('on POST', () => {

    it('should throw an error if the session doesn’t exist', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => undefined);

      const app = createApp();

      await request(app)
        .post(SERVICE_ADDRESS_PAGE_URI)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should redirect to the Service Address page if data is provided by the user', async () => {

      const testData: Address = generateTestData();
      const app = createApp();

      await request(app)
        .post(SERVICE_ADDRESS_PAGE_URI)
        .send(testData).expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toContain(SERVICE_ADDRESS_PAGE_URI);
        });
    });

    it('should redirect to the Service Address page if no data is provided by the user', async () => {

      const app = createApp();

      await request(app)
        .post(SERVICE_ADDRESS_PAGE_URI)
        .send({}).expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toContain(SERVICE_ADDRESS_PAGE_URI);
        });
    });

  });
});
