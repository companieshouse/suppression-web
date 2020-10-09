import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { SuppressionSession } from '../../src/models/suppressionSessionModel';

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
})

describe('ConfirmationController', () => {

  const pageTitle = 'Confirmation page';

  describe('on GET', () => {

    it('should return 200 and render the Confirmation page', async () => {

      const testData = generateTestData()
      delete testData.applicantDetails.previousName;
      delete testData.serviceAddress!.line2;

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => testData);

      const app = createApp();

      jest.spyOn(SessionService, 'getSession').mockImplementationOnce(() => {
        return { applicationReference: 'TEST-TEST'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => {
        return Promise.resolve(testData)
      });

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

      jest.spyOn(SessionService, 'getSession').mockImplementationOnce(() => {
        return undefined
      });

      const app = createApp();

      await request(app)
        .get(CONFIRMATION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when no application reference is present in the session', async () => {

      jest.spyOn(SessionService, 'getSession').mockImplementationOnce(() => {
        return { applicationReference: ''} as SuppressionSession
      });


      const testData = generateTestData()
      delete testData.applicationReference;

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => testData);
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
