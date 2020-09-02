import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import {DOCUMENT_DETAILS_PAGE_URI} from '../../src/routes/paths';
import {
  expectToHaveErrorMessages,
  expectToHaveErrorSummaryContaining, expectToHaveInput, expectToHavePopulatedInput,
  expectToHaveTitle
} from '../HtmlPatternAssertions'
import { createApp } from '../ApplicationFactory';
import SessionService from '../../src/services/SessionService';
import { DocumentDetails, SuppressionData } from '../../src/models/SuppressionDataModel';

const expectedTitle: string = 'Document details';
const missingCompanyNameErrorMessage: string = 'Company name is required';
const missingCompanyNumberErrorMessage: string = 'Company number is required';
const missingDocumentDescErrorMessage: string = 'Document description is required';
const missingDocumentDateErrorMessage: string = 'Document date is required';
const missingYearErrorMessage: string = 'You must enter a year';
const invalidDateErrorMessage: string = 'Enter a real date';

describe('DocumentDetailsController', () => {

  describe('on GET', () => {

    it('should return 200 and render the page', async () => {

      const app = createApp();

      await request(app)
        .get(DOCUMENT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveInput(response.text, 'companyName', 'Company name');
          expectToHaveInput(response.text, 'companyNumber', 'Company number');
          expectToHaveInput(response.text, 'description', 'Document description');
          expectToHaveInput(response.text, 'day', 'Day');
          expectToHaveInput(response.text, 'month', 'Month');
          expectToHaveInput(response.text, 'year', 'Year');
        });
    });

    it('should return 200 when accessing page with a session', async () => {

      const app = createApp();

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => {
        return {
          documentDetails: documentDetails
        } as SuppressionData
      });

      const documentDetails = {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        date: '2020-01-01',
        day: '01',
        month: '01',
        year: '2020'
      } as DocumentDetails

      await request(app)
        .get(DOCUMENT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHavePopulatedInput(response.text, 'companyName', documentDetails.companyName);
          expectToHavePopulatedInput(response.text, 'companyNumber', documentDetails.companyNumber);
          expectToHavePopulatedInput(response.text, 'description', documentDetails.description);
          expectToHavePopulatedInput(response.text, 'day', '01');
          expectToHavePopulatedInput(response.text, 'month', '01');
          expectToHavePopulatedInput(response.text, 'year', '2020');
        });
    });
  });

  describe('on POST', () => {

    it('should return 302 response when valid data was submitted', async () => {

      const app = createApp();

      const documentDetails = {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '01',
        month: '01',
        year: '2020'
      }

      await request(app)
        .post(DOCUMENT_DETAILS_PAGE_URI)
        .send(documentDetails)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toEqual(DOCUMENT_DETAILS_PAGE_URI)
        });
    });

    it('should return 422 response with rendered error messages when no document details were submitted', async () => {

      const app = createApp();

      await request(app)
        .post(DOCUMENT_DETAILS_PAGE_URI)
        .send({})
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveErrorSummaryContaining(response.text, [missingCompanyNameErrorMessage,
            missingCompanyNumberErrorMessage, missingDocumentDescErrorMessage, missingDocumentDateErrorMessage]);
          expectToHaveErrorMessages(response.text, [missingCompanyNameErrorMessage,
            missingCompanyNumberErrorMessage, missingDocumentDescErrorMessage, missingDocumentDateErrorMessage]);
        });
    });

    it('should return 422 response with rendered error message when all date components are missing', async () => {

      const app = createApp();

      const documentDetails = {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
      }

      await request(app)
        .post(DOCUMENT_DETAILS_PAGE_URI)
        .send(documentDetails)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveErrorSummaryContaining(response.text, [missingDocumentDateErrorMessage]);
          expectToHaveErrorMessages(response.text, [missingDocumentDateErrorMessage]);
        });
    });

    it('should return 422 response with rendered error messages when a date component is missing', async () => {

      const app = createApp();

      const documentDetails = {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '01',
        month: '01'
      }

      await request(app)
        .post(DOCUMENT_DETAILS_PAGE_URI)
        .send(documentDetails)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveErrorSummaryContaining(response.text, [missingYearErrorMessage]);
          expectToHaveErrorMessages(response.text, [missingYearErrorMessage]);
        });
    });

    it('should return 422 response with rendered error messages when invalid date was submitted', async () => {

      const app = createApp();

      const documentDetails = {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '34',
        month: '01',
        year: '2020'
      }

      await request(app)
        .post(DOCUMENT_DETAILS_PAGE_URI)
        .send(documentDetails)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveErrorSummaryContaining(response.text, [invalidDateErrorMessage]);
          expectToHaveErrorMessages(response.text, [invalidDateErrorMessage]);
        });
    });
  });
});
