import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import {
  ACCESSIBILITY_STATEMENT_URI,
  ADDRESS_TO_REMOVE_PAGE_URI,
  APPLICANT_DETAILS_PAGE_URI,
  CHECK_SUBMISSION_PAGE_URI,
  CONFIRMATION_PAGE_URI,
  CONTACT_DETAILS_PAGE_URI,
  DOCUMENT_DETAILS_PAGE_URI,
  PAYMENT_REVIEW_PAGE_URI,
  ROOT_URI,
  SERVICE_ADDRESS_PAGE_URI
} from '../../src/routes/paths';

import { SuppressionData } from '../../src/models/SuppressionDataModel';
import { SuppressionSession } from '../../src/models/SuppressionSessionModel';
import SessionService from '../../src/services/session/SessionService'
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');
jest.mock('../../src/services/suppression/SuppressionService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Applied Navigation Middleware', () => {

  describe('exempt pages', () => {

    it('should not redirect user from landing page', async () => {
      const app = createApp(false, true);

      await request(app).get(ROOT_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
        });
    });

    it('should not redirect user from accessibility statement', async () => {
      const app = createApp(false, true);

      await request(app).get(ACCESSIBILITY_STATEMENT_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
        });
    });

    it('should not redirect user from applicant details page', async () => {
      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(async () => {
        return Promise.resolve({} as SuppressionData)
      });

      const app = createApp(false, true);

      await request(app).get(APPLICANT_DETAILS_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
        });
    });

  });

  describe('all other (non-exempt) pages', () => {

    const pageList = [
      { name: 'Address To Remove', uri: ADDRESS_TO_REMOVE_PAGE_URI },
      { name: 'Document Details', uri: DOCUMENT_DETAILS_PAGE_URI },
      { name: 'Service Address', uri: SERVICE_ADDRESS_PAGE_URI },
      { name: 'Contact Details', uri: CONTACT_DETAILS_PAGE_URI },
      { name: 'Check Submission', uri: CHECK_SUBMISSION_PAGE_URI },
      { name: 'Payment Review', uri: PAYMENT_REVIEW_PAGE_URI },
    ];

    jest.spyOn(SuppressionService.prototype, 'get').mockImplementation(async () => {
      return Promise.resolve( generateTestData() as SuppressionData)
    });

    for (const page of pageList) {
      it(`should redirect from ${page.name} to the Applicant Details page when no permissions are set`, async () => {

        const app = createApp(false, true);

        await request(app).get(page.uri)
          .expect(response => {
            expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).toContain(APPLICANT_DETAILS_PAGE_URI);
          });
      });
    }

    for (const page of pageList) {
      it(`should redirect from ${page.name} to the Applicant Details page when no session is set`, async () => {
        jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => undefined);

        const app = createApp(false, true);

        await request(app).get(page.uri)
          .expect(response => {
            expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).toContain(APPLICANT_DETAILS_PAGE_URI);
          });
      });
    }

    for (const page of pageList.slice(1)) {
      it(`should redirect from ${page.name} to the most recent page in the permissions stack when the appropriate permission is not set`, async () => {

        const app = createApp(false, true);
        jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
          return {
            navigationPermissions: [ ADDRESS_TO_REMOVE_PAGE_URI ]
          } as SuppressionSession;
        });

        await request(app).get(page.uri)
          .expect(response => {
            expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
            expect(response.header.location).toContain(ADDRESS_TO_REMOVE_PAGE_URI);
          });
      });
    }

    for (const page of pageList) {
      it(`should not redirect from ${page.name} if the appropriate permission is set`, async () => {

        const app = createApp(false, true);
        jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
          return {
            navigationPermissions: [ page.uri ]
          } as SuppressionSession;
        });

        await request(app).get(page.uri)
          .expect(response => {
            expect(response.status).toEqual(StatusCodes.OK);
          });
      });
    }

  });

  it('should not redirect from the Confirmation page if previousApplicationReference is present in the session', async () => {

    const app = createApp(false, true);
    jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
      return {
        previousApplicationReference: 'TEST1-TEST1'
      } as SuppressionSession;
    });

    await request(app).get(CONFIRMATION_PAGE_URI)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.OK);
      });
  });
});
