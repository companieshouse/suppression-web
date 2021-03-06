import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { DocumentDetails, SuppressionData } from '../../src/models/SuppressionDataModel';
import { SuppressionSession } from '../../src/models/SuppressionSessionModel';
import {
  ADDRESS_TO_REMOVE_PAGE_URI,
  DOCUMENT_DETAILS_PAGE_URI,
  SERVICE_ADDRESS_PAGE_URI
} from '../../src/routes/paths';
import SessionService from '../../src/services/session/SessionService';
import { SuppressionUnauthorisedError } from '../../src/services/suppression/errors';
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveErrorMessages, expectToHaveErrorSummaryContaining, expectToHaveInput,
  expectToHavePopulatedInput, expectToHaveTitle, expectToHaveTitleWithError
} from '../HtmlPatternAssertions'
import { generateTestData } from '../TestData';

const expectedTitle: string = 'What are the document details\\?';
const missingCompanyNameErrorMessage: string = 'Enter the company name';
const missingCompanyNumberErrorMessage: string = 'Enter the company number';
const missingDocumentDescErrorMessage: string = 'Enter the document name and description';
const missingDocumentDateErrorMessage: string = 'Enter the date the document was added to the register';
const missingYearErrorMessage: string = 'You must enter a year';
const invalidDateErrorMessage: string = 'Enter a real date';

jest.mock('../../src/services/session/SessionService');

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('DocumentDetailsController', () => {

  describe('on GET', () => {

    it('should return 200 and render the page', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => {
        return Promise.resolve({} as SuppressionData)
      });

      const app = createApp();

      await request(app)
        .get(DOCUMENT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveBackButton(response.text, ADDRESS_TO_REMOVE_PAGE_URI);
          expectToHaveInput(response.text, 'companyName', 'Company name');
          expectToHaveInput(response.text, 'companyNumber', 'Company number');
          expectToHaveInput(response.text, 'description', 'Document name and description');
          expectToHaveInput(response.text, 'day', 'Day');
          expectToHaveInput(response.text, 'month', 'Month');
          expectToHaveInput(response.text, 'year', 'Year');
        });
    });

    it('should render error when no session present ', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => undefined);

      const app = createApp();

      await request(app)
        .get(DOCUMENT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when no application reference in session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any } as SuppressionSession
      });

      const app = createApp();

      await request(app)
        .get(DOCUMENT_DETAILS_PAGE_URI)
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
        .get(DOCUMENT_DETAILS_PAGE_URI)
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
        .get(DOCUMENT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should return 200 with pre-populated data when accessing page with a session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementation(() => Promise.resolve(generateTestData()));

      const app = createApp();

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

    beforeEach(() => {
      jest.spyOn(SessionService, 'appendNavigationPermissions');
    });

    it('should throw an error if application reference not in session', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any } as SuppressionSession
      });

      const app = createApp();

      await request(app)
        .post(DOCUMENT_DETAILS_PAGE_URI)
        .send(generateTestData().documentDetails)
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

      const documentDetails = {
        companyName: 'company-name-test',
        companyNumber: 'NI000000',
        description: 'This is a document',
        day: '01',
        month: '01',
        year: '2020'
      }

      const app = createApp();

      await request(app)
        .post(DOCUMENT_DETAILS_PAGE_URI)
        .send(documentDetails)
        .expect(response => {
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    });

    it('should redirect to the Service Address page when valid data was submitted', async () => {

      jest.spyOn(SuppressionService.prototype, 'patch').mockImplementation(() => Promise.resolve());

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
          expect(SessionService.appendNavigationPermissions).toHaveBeenCalled();
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toEqual(SERVICE_ADDRESS_PAGE_URI)
        });
    });

    it('should return 422 response with rendered error messages when no document details were submitted', async () => {

      const app = createApp();

      await request(app)
        .post(DOCUMENT_DETAILS_PAGE_URI)
        .send({})
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expectToHaveTitleWithError(response.text, expectedTitle);
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
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expectToHaveTitleWithError(response.text, expectedTitle);
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
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expectToHaveTitleWithError(response.text, expectedTitle);
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
          expect(SessionService.appendNavigationPermissions).not.toHaveBeenCalled();
          expectToHaveTitleWithError(response.text, expectedTitle);
          expectToHaveErrorSummaryContaining(response.text, [invalidDateErrorMessage]);
          expectToHaveErrorMessages(response.text, [invalidDateErrorMessage]);
        });
    });
  });
});
