import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { PAYMENT_REVIEW_PAGE_URI } from '../../src/routes/paths';
import { PaymentService } from '../../src/services/payment/PaymentService';
import { createApp } from '../ApplicationFactory';
import { expectToHaveTitle } from '../HtmlPatternAssertions'

jest.mock('../../src/services/session/SessionService');
jest.mock('../../src/services/suppression/SuppressionService');
jest.mock('../../src/services/payment/PaymentService');
jest.mock('../../src/middleware/AuthMiddleware');

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

    it('should return status code 302 and redirect to GOV Pay', async () => {

      const mockGovPayUrl = 'https://mock.payments.service.gov.uk/v1/payments/123456';

      jest.spyOn(PaymentService.prototype, 'initPayment').mockImplementationOnce(async () => {
        return Promise.resolve(mockGovPayUrl);
      });

      await request(app)
        .post(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toEqual(mockGovPayUrl)
        });
    });

    it('should return status code 500 and redirect to error page', async () => {

      jest.spyOn(PaymentService.prototype, 'initPayment').mockImplementationOnce(async () => {
        return Promise.reject();
      });

      await request(app)
        .post(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });
  });
});
