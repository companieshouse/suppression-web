import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { Address, SuppressionData } from '../../src/models/SuppressionDataModel'
import { SuppressionSession } from '../../src/models/SuppressionSessionModel';
import {
  CONTACT_DETAILS_PAGE_URI,
  DOCUMENT_DETAILS_PAGE_URI,
  SERVICE_ADDRESS_PAGE_URI
} from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService'
import { SuppressionUnauthorisedError } from '../../src/services/suppression/errors';
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveInput,
  expectToHavePopulatedInput,
  expectToHaveTitle
} from '../HtmlPatternAssertions'
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');

afterEach(() => {
  jest.restoreAllMocks();
})

describe('ServiceAddressController', () => {

  const pageTitle = 'What address do you want to replace your home address with\\?';

  describe('on GET', () => {

    it('should return 200 and render the Service Address Page', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => {
        return Promise.resolve({} as SuppressionData)
      });

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

    it('should render error when no session present ', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => undefined);

      const app = createApp();

      await request(app)
        .get(SERVICE_ADDRESS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when no application reference in session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return {applicationReference: undefined as any} as SuppressionSession
      });

      const app = createApp();

      await request(app)
        .get(SERVICE_ADDRESS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when suppression service throws exception', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        throw Error('')
      });

      const app = createApp();

      await request(app)
        .get(SERVICE_ADDRESS_PAGE_URI)
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

      const app = createApp();

      await request(app)
        .get(SERVICE_ADDRESS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should prepopulate fields when relevant data is found in the session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      const testData: SuppressionData = generateTestData();

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => Promise.resolve(testData));

      const app = createApp();

      await request(app)
        .get(SERVICE_ADDRESS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveBackButton(response.text, DOCUMENT_DETAILS_PAGE_URI);
          expectToHavePopulatedInput(response.text, 'line1', testData.serviceAddress!.line1);
          expectToHavePopulatedInput(response.text, 'line2', testData.serviceAddress!.line2!);
          expectToHavePopulatedInput(response.text, 'town', testData.serviceAddress!.town);
          expectToHavePopulatedInput(response.text, 'county', testData.serviceAddress!.county);
          expectToHavePopulatedInput(response.text, 'postcode', testData.serviceAddress!.postcode);
          expectToHavePopulatedInput(response.text, 'country', testData.serviceAddress!.country);
        });
    });

  });

  describe('on POST', () => {

    beforeEach(() => {
      jest.spyOn(SessionService, 'appendNavigationPermissions');
    });

    it('should throw an error if the session doesn’t exist', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => undefined);

      const app = createApp();

      await request(app)
        .post(SERVICE_ADDRESS_PAGE_URI)
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
        throw new SuppressionUnauthorisedError(`patch suppression unauthorised`);
      });

      const app = createApp();
      const testData = generateTestData().serviceAddress;

      await request(app)
        .post(SERVICE_ADDRESS_PAGE_URI)
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

      const app = createApp();
      const testData = generateTestData().serviceAddress;

      await request(app)
        .post(SERVICE_ADDRESS_PAGE_URI)
        .send(testData)
        .expect(response => {
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    });

    it('should redirect to the Contact Address page if data is provided by the user', async () => {

      jest.spyOn(SuppressionService.prototype, 'save').mockImplementationOnce(() => Promise.resolve('12345-12345'));

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementationOnce(() => Promise.resolve());

      const testData: Address | undefined = generateTestData().serviceAddress;
      const app = createApp();

      await request(app)
        .post(SERVICE_ADDRESS_PAGE_URI)
        .send(testData).expect(response => {
          expect(SessionService.appendNavigationPermissions).toHaveBeenCalled();
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toContain(CONTACT_DETAILS_PAGE_URI);
        });
    });

    it('should redirect to the Contact Address page if no data is provided by the user', async () => {

      jest.spyOn(SuppressionService.prototype, 'save').mockImplementationOnce(() => Promise.resolve('12345-12345'));

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementationOnce(() => Promise.resolve());

      const app = createApp();

      await request(app)
        .post(SERVICE_ADDRESS_PAGE_URI)
        .send({}).expect(response => {
          expect(SessionService.appendNavigationPermissions).toHaveBeenCalled();
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toContain(CONTACT_DETAILS_PAGE_URI);
        });
    });

  });
});
