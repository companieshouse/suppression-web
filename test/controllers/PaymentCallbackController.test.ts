
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { PaymentStatus } from '../../src/models/PaymentStatus';
import { SuppressionSession } from '../../src/models/suppressionSessionModel';
import { CONFIRMATION_PAGE_URI, PAYMENT_CALLBACK_URI, PAYMENT_REVIEW_PAGE_URI } from '../../src/routes/paths';
import { PaymentService } from '../../src/services/payment/PaymentService';
import SessionService from '../../src/services/session/SessionService';
import { createApp } from '../ApplicationFactory';

jest.mock('../../src/services/session/SessionService');
jest.mock('../../src/services/payment/PaymentService');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PaymentCallbackController', () => {

  const app = createApp();

  const queryData = {
      state: 'LEGIT1234',
      status: PaymentStatus.PAID,
      ref: 'TESTA_TESTA'
  };

  it('should render error when the required query parameters are not sent', async () => {
    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.text).toContain('Sorry, there is a problem with the service');
      });
  });

  it('should render error if the payment status is invalid', async () => {

    const testQuery = { ...queryData };
    testQuery.status = 'rubbish' as PaymentStatus;

    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .query(testQuery)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.text).toContain('Sorry, there is a problem with the service');
      });
  });

  it('should render error when no session present', async () => {

    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .query(queryData)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.text).toContain('Sorry, there is a problem with the service')
      });
  });

  it('should render error when payment state has been tampered with', async () => {

    const testQuery = { ...queryData };
    testQuery.state = 'TAMPERED';

    jest.spyOn(SessionService, 'getSession').mockImplementationOnce(() => {
      return {
        applicationReference: '12345-12345',
        paymentDetails: {
          stateUUID: 'LEGIT1234',
          resourceUri: 'payments/TEST123456'
        }
      } as SuppressionSession
    });

    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .query(testQuery)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.text).toContain('Sorry, there is a problem with the service')
      });
  });

  it('should redirect the user to the Payment Review page if payment was unsuccessful', async () => {

    const testQuery = { ...queryData };
    testQuery.status = PaymentStatus.FAILED;

    jest.spyOn(SessionService, 'getSession').mockImplementationOnce(() => {
      return {
        applicationReference: '12345-12345',
        paymentDetails: {
          stateUUID: 'LEGIT1234',
          resourceUri: 'payments/TEST123456'
        }
      } as SuppressionSession
    });

    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .query(testQuery)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toEqual(PAYMENT_REVIEW_PAGE_URI)
      });
  });

  it('should redirect the user to the Payment Review page if verification of successful payment status failed', async () => {

    jest.spyOn(SessionService, 'getSession').mockImplementationOnce(() => {
      return {
        applicationReference: '12345-12345',
        paymentDetails: {
          stateUUID: 'LEGIT1234',
          resourceUri: 'payments/TEST123456'
        }
      } as SuppressionSession
    });

    jest.spyOn(PaymentService.prototype, 'getPaymentStatus').mockImplementationOnce(async () => {
      return Promise.resolve(PaymentStatus.FAILED);
    });

    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .query(queryData)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toEqual(PAYMENT_REVIEW_PAGE_URI)
      });
  });

  it('should redirect the user to the Confirmation page if payment was successful (and verified)', async () => {

    jest.spyOn(SessionService, 'getSession').mockImplementationOnce(() => {
      return {
        applicationReference: '12345-12345',
        paymentDetails: {
          stateUUID: 'LEGIT1234',
          resourceUri: 'payments/TEST123456'
        }
      } as SuppressionSession
    });

    jest.spyOn(PaymentService.prototype, 'getPaymentStatus').mockImplementationOnce(async () => {
      return Promise.resolve(PaymentStatus.PAID);
    });

    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .query(queryData)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toEqual(CONFIRMATION_PAGE_URI)
      });
  });

});
