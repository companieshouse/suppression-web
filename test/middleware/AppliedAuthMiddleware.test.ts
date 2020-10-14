import * as authMiddleware from '@companieshouse/web-security-node';
import { StatusCodes } from 'http-status-codes/build';
import request from 'supertest';
import { SuppressionData } from '../../src/models/SuppressionDataModel';

import {
  ADDRESS_TO_REMOVE_PAGE_URI,
  APPLICANT_DETAILS_PAGE_URI,
  DOCUMENT_DETAILS_PAGE_URI,
  PAYMENT_REVIEW_PAGE_URI,
  ROOT_URI,
  SERVICE_ADDRESS_PAGE_URI
} from '../../src/routes/paths';
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import { generateTestData } from '../TestData';

jest.mock('../../src/services/session/SessionService');
jest.mock('../../src/services/suppression/SuppressionService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Applied auth middleware', () => {

  const pageList = [
    {name: 'Applicant Details', uri: APPLICANT_DETAILS_PAGE_URI},
    {name: 'Address To Remove', uri: ADDRESS_TO_REMOVE_PAGE_URI},
    {name: 'Document Details', uri: DOCUMENT_DETAILS_PAGE_URI},
    {name: 'Service Address', uri: SERVICE_ADDRESS_PAGE_URI},
    {name: 'Payment Review', uri: PAYMENT_REVIEW_PAGE_URI},
  ];

  describe('Unauthenticated user: landing page', () => {

    it('should not redirect user to sign in page', async () => {
      for (const page of [ROOT_URI, ROOT_URI + '/']) {
        const app = createApp(true);

        await request(app).get(page)
          .expect(response => {
            expect(response.status).toEqual(StatusCodes.OK);
          });
      }
    });
  });

  describe('Unauthenticated user: all pages after the landing page', () => {

    for (const page of pageList) {
      it(`should redirect from ${page.name} to sign in page`, async () => {

        const app = createApp(true);

        jest.spyOn(authMiddleware, 'authMiddleware')
          .mockReturnValue((req, res, next) => {
            return res.redirect('/fakeurl');
          });

        await request(app).get(page.uri)
          .expect(response => {
            expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
            expect(response.text).toContain('/fakeurl');
          });
      });
    }
  });

  describe('Authenticated user: all pages', () => {

    jest.spyOn(SuppressionService.prototype, 'get').mockImplementation(() => {
      return Promise.resolve( generateTestData() as SuppressionData)
    });

    pageList.push({name: 'Landing Page', uri: ROOT_URI});

    for (const page of pageList) {
      it(`should not redirect from ${page.name} to sign in page`, async () => {

        const app = createApp(true);

        jest.spyOn(authMiddleware, 'authMiddleware')
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

});
