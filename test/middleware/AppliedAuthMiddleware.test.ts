import { StatusCodes } from 'http-status-codes/build';
import request from 'supertest';
import { authMiddleware } from 'web-security-node';
import {
  ADDRESS_TO_REMOVE_PAGE_URI,
  APPLICANT_DETAILS_PAGE_URI,
  DOCUMENT_DETAILS_PAGE_URI,
  PAYMENT_REVIEW_PAGE_URI,
  ROOT_URI
} from '../../src/routes/paths';
import { createApp } from '../ApplicationFactory';

jest.mock('../../src/services/SessionService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Applied auth middleware', () => {

  describe('All pages after the landing page', () => {

    const webSecurityModule = require('web-security-node');

    const pageList = [
      {name: 'Applicant Details', uri: APPLICANT_DETAILS_PAGE_URI},
      {name: 'Address To Remove', uri: ADDRESS_TO_REMOVE_PAGE_URI},
      {name: 'Document Details', uri: DOCUMENT_DETAILS_PAGE_URI},
      {name: 'Payment Review', uri: PAYMENT_REVIEW_PAGE_URI},
    ];

    for (const page of pageList) {
      it(`The ${page.name} page should redirect unauthenticated user to sign in page`, async () => {

        const app = createApp(true);

        jest.spyOn(webSecurityModule, 'authMiddleware')
          .mockReturnValue((req, res, next) => {
            return res.redirect('/fakeurl');
          });

        await request(app).get(page.uri)
          .expect(response => {
            expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
            expect(response.text).toContain('/fakeurl');
          });
      });

      it(`The ${page.name} page should not redirect authenticated user to sign in page`, async () => {

        const app = createApp(true);

        jest.spyOn(webSecurityModule, 'authMiddleware')
          .mockReturnValue((req, res, next) => {
            return next();
          });

        await request(app).get(page.uri)
          .expect(response => {
            expect(response.status).toEqual(StatusCodes.OK);
          });
      });
    }
  });

  describe('Landing page', () => {

    it(`should not redirect unauthenticated user to sign in page `, async () => {

      const app = createApp(true);

      await request(app).get(ROOT_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
        });
    });
  });

});
