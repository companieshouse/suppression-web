import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { PAYMENT_REVIEW_PAGE_URI } from '../../src/routes/paths';
import { createApp } from '../ApplicationFactory';
import { expectToHaveTitle } from '../HtmlPatternAssertions'

jest.mock('../../src/services/Session/SessionService');
jest.mock('../../src/services/Suppression/SuppressionService');

describe('PaymentReviewController', () => {

  const app = createApp();

  describe('on GET', () => {

    it('should return 200 and render the Payment Review Page', async () => {
      const expectedTitle = 'Review your payment';

      await request(app)
        .get(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, expectedTitle);
          expect(response.text).toContain('The total amount to pay is £32')
          expect(response.text).toMatch(/<button class="govuk-button".*>.*Continue to payment.*<\/button>/s)
        });
    });
  });

  describe('on POST', () => {

    it('should return status code 302 and redirect', async () => {

      await request(app)
        .post(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toEqual(PAYMENT_REVIEW_PAGE_URI)
        });
    });
  });
});
