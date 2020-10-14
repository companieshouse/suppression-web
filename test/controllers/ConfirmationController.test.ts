import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { SuppressionSession } from '../../src/models/SuppressionSessionModel';

import { CONFIRMATION_PAGE_URI } from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService'
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveTableRow,
  expectToHaveTitle
} from '../HtmlPatternAssertions'
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ConfirmationController', () => {

  const pageTitle = 'Confirmation page';

  describe('on GET', () => {

    it('should render error when no application reference in session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any } as SuppressionSession
      });

      const app = createApp();

      await request(app)
        .get(CONFIRMATION_PAGE_URI)
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
        .get(CONFIRMATION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should throw an error if get suppression service throws exception', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345' as any } as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementation(() => {
        throw new Error('mocking error')
      });

      const app = createApp();

      await request(app)
        .get(CONFIRMATION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should return 200 and render the Confirmation page', async () => {

      const testData = generateTestData()
      delete testData.applicantDetails.previousName;
      delete testData.serviceAddress!.line2;

      const app = createApp();

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: 'TEST-TEST'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => Promise.resolve(testData));

      await request(app)
        .get(CONFIRMATION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveTableRow(response.text, 'Company name', 'company-name-test');
          expectToHaveTableRow(response.text, 'Company number', 'NI000000');
          expectToHaveTableRow(response.text, 'Document description', 'This is a document');
          expectToHaveTableRow(response.text, 'Payment received', '£32');
          expect(response.text).toContain(
            'We will send a confirmation email to ch-test@example.com which contains your reference number.'
          )
          expect(response.text).toContain(
            'Your reference number is<br><strong>TEST-TEST</strong>'
          )
        });
    });

    it('should render error when no session present ', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => undefined);

      const app = createApp();

      await request(app)
        .get(CONFIRMATION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when no application reference is present in the session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any} as SuppressionSession
      });

      const app = createApp();

      await request(app)
        .get(CONFIRMATION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });
  });
});
