import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { PAYMENT_REVIEW_PAGE_URI } from '../../src/routes/paths';
import { PaymentService } from '../../src/services/payment/PaymentService';
import SessionService from '../../src/services/session/SessionService';
import { createApp } from '../ApplicationFactory';
import { expectToHaveButton, expectToHaveTitle } from '../HtmlPatternAssertions'

jest.mock('../../src/services/session/SessionService');
jest.mock('../../src/services/suppression/SuppressionService');
jest.mock('../../src/services/payment/PaymentService');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PaymentReviewController', () => {

  const app = createApp();

  describe('on GET', () => {

    it('should render error when no session present ', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementation(() => {
        return undefined
      });

      await request(app)
        .get(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should return 200 and render the Payment Review Page', async () => {
      const expectedTitle = 'Review your payment';

      await request(app)
        .get(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveButton(response.text, 'Continue to payment');
          expect(response.text).toContain('The total amount to pay is £32');
        });
    });
  });

  describe('on POST', () => {

    it('should return status code 302 and redirect to GOV Pay', async () => {

      const mockGovPayUrl = 'https://mock.payments.service.gov.uk/v1/payments/123456';

      jest.spyOn(PaymentService.prototype, 'generatePaymentUrl').mockImplementationOnce(async () => {
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

      jest.spyOn(PaymentService.prototype, 'generatePaymentUrl').mockImplementationOnce(async () => {
        return Promise.reject(new Error());
      });

      await request(app)
        .post(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });
  });
});
