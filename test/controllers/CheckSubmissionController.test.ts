import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { CHECK_SUBMISSION_PAGE_URI } from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService'
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveButton,
  expectToHaveSummaryRow,
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
          expectToHaveSummaryRow(response.text, 'Full name', 'John Doe');
          expectToHaveSummaryRow(response.text,
            'Has the applicant used a different name for business purposes in the last 20 years\\?',
            'No');
          expect(response.text).not.toContain('Previous name');
          expectToHaveSummaryRow(response.text, 'Date of birth', '1 May 1980');
          expectToHaveSummaryRow(response.text,
            'What home address would you like to remove\\?',
            '1 Residential Avenue<br>Selly Oak<br>Birmingham<br>West Midlands<br>B29 4TD<br>United Kingdom');
          expectToHaveSummaryRow(response.text, 'Company name', 'company-name-test');
          expectToHaveSummaryRow(response.text, 'Company number', 'NI000000');
          expectToHaveSummaryRow(response.text, 'Document description', 'This is a document');
          expectToHaveSummaryRow(response.text, 'Document date', '1 January 2020');
          expectToHaveSummaryRow(response.text,
            'What address do you want to replace your home address with\\?',
            '1 Main Street<br>Cardiff<br>Cardiff<br>CF14 3UZ<br>United Kingdom');
          expectToHaveSummaryRow(response.text, 'Email address', 'test@example.com');
          expectToHaveSummaryRow(response.text,
            'Contact address',
            '1st Avenue<br>New York<br>New York<br>NY<br>USA');
          expectToHaveButton(response.text, 'Accept and submit');
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
          expectToHaveSummaryRow(response.text, 'Previous name', 'Jane Doe');
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
