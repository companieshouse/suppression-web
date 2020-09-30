import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { CHECK_SUBMISSION_PAGE_URI } from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService'
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveButton,
  expectToHaveTableRow,
  expectToHaveTitle
} from '../HtmlPatternAssertions'
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');

afterEach(() => {
  jest.restoreAllMocks();
})

describe('CheckSubmissionController', () => {

  const pageTitle = 'Check your answers';

  describe('on GET', () => {

    it('should return 200 and render the Check Submission page', async () => {

      const testData = generateTestData()
      delete testData.applicantDetails.previousName;
      delete testData.serviceAddress!.line2;

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => testData);

      const app = createApp();

      await request(app)
        .get(CHECK_SUBMISSION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveTableRow(response.text, 'Full name', 'John Doe');
          expectToHaveTableRow(response.text,
            'Has the applicant used a different name for business purposes in the last 20 years\\?',
            'No');
          expect(response.text).not.toContain('Previous name');
          expectToHaveTableRow(response.text, 'Date of birth', '1 May 1980');
          expectToHaveTableRow(response.text,
            'What home address would you like to remove\\?',
            '1 Residential Avenue<br>Selly Oak<br>Birmingham<br>West Midlands<br>B29 4TD<br>United Kingdom');
          expectToHaveTableRow(response.text, 'Company name', 'company-name-test');
          expectToHaveTableRow(response.text, 'Company number', 'NI000000');
          expectToHaveTableRow(response.text, 'Document description', 'This is a document');
          expectToHaveTableRow(response.text, 'Document date', '1 January 2020');
          expectToHaveTableRow(response.text,
            'What address do you want to replace your home address with\\?',
            '1 Main Street<br>Cardiff<br>Cardiff<br>CF14 3UZ<br>United Kingdom');
          expectToHaveTableRow(response.text, 'Email address', 'test@example.com');
          expectToHaveButton(response.text, 'Confirm and submit');
        });
    });

    it('should render the "Previous name" row when a previous name is present in the submission', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => generateTestData());
      const app = createApp();

      await request(app)
        .get(CHECK_SUBMISSION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, pageTitle);
          expectToHaveTableRow(response.text, 'Previous name', 'Jane Doe');
        });
    });

    it('should render error when no session present ', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => undefined);
      const app = createApp();

      await request(app)
        .get(CHECK_SUBMISSION_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

  });

  describe('on POST', () => {

    it('should redirect to the Check Submission page', async () => {

      const app = createApp();

      await request(app)
        .post(CHECK_SUBMISSION_PAGE_URI)
        .send({}).expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toContain(CHECK_SUBMISSION_PAGE_URI);
        });
    });

  });
});
