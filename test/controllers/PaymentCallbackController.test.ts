
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { PAYMENT_CALLBACK_URI } from '../../src/routes/paths';
import { createApp } from '../ApplicationFactory';

jest.mock('../../src/services/session/SessionService');
jest.mock('../../src/services/payment/PaymentService');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PaymentReviewController', () => {

  const app = createApp();

  it('should render error when the required query parameters are not sent', async() => {
    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.text).toContain('Sorry, there is a problem with the service');
      })
  });

  it('should render error if the payment status is invalid', async() => {
    await request(app)
      .get(PAYMENT_CALLBACK_URI)
      .query({ state: 'TEST', status: 'rubbish', ref: 'TESTA_TESTA' })
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.text).toContain('Sorry, there is a problem with the service');
      })
  });

});
