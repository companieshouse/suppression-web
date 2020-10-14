import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { SuppressionData } from '../../src/models/SuppressionDataModel';
import { SuppressionSession } from '../../src/models/SuppressionSessionModel';

import { CHECK_SUBMISSION_PAGE_URI, PAYMENT_REVIEW_PAGE_URI } from '../../src/routes/paths';
import { PaymentService } from '../../src/services/payment/PaymentService';
import SessionService from '../../src/services/session/SessionService';
import { SuppressionService } from '../../src/services/suppression/SuppressionService';
import { createApp } from '../ApplicationFactory';
import { expectToHaveBackButton, expectToHaveButton, expectToHaveTitle } from '../HtmlPatternAssertions'

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

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => undefined);

      await request(app)
        .get(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when no application reference in session', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any } as SuppressionSession
      });

      await request(app)
        .get(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.text).toContain('Sorry, there is a problem with the service')
        });
    });

    it('should render error when suppression service throws exception', async () => {

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        throw Error('')
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

      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: '12345-12345'} as SuppressionSession
      });

      jest.spyOn(SuppressionService.prototype, 'get').mockImplementationOnce(() => {
        return Promise.resolve({} as SuppressionData)
      });

      await request(app)
        .get(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveBackButton(response.text, CHECK_SUBMISSION_PAGE_URI);
          expectToHaveButton(response.text, 'Continue to payment');
          expect(response.text).toContain('The total amount to pay is £32');
        });
    });
  });

  describe('on POST', () => {

    it('should throw an error if application reference not in session', async () => {
      jest.spyOn(SessionService, 'getSuppressionSession').mockImplementationOnce(() => {
        return { applicationReference: undefined as any } as SuppressionSession
      });

      await request(app)
        .post(PAYMENT_REVIEW_PAGE_URI)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return status code 302 and redirect to GOV Pay', async () => {

      const mockRedirectUrl = 'https://mock.payments.service.gov.uk/v1/payments/123456/pay';
      const mockResourceUri = 'payments/123456';

      jest.spyOn(PaymentService.prototype, 'generatePaymentUrl').mockImplementationOnce(async () => {
        return Promise.resolve({
          redirectUrl: mockRedirectUrl,
          resourceUri: mockResourceUri
        });
      });

      await request(app)
        .post(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toEqual(mockRedirectUrl)
        });
    });

    it('should return status code 500 and redirect to error page', async () => {

      jest.spyOn(PaymentService.prototype, 'generatePaymentUrl').mockImplementationOnce(async () => Promise.reject(new Error()));

      await request(app)
        .post(PAYMENT_REVIEW_PAGE_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });
  });
});
