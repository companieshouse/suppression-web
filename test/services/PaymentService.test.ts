import * as nodeSdk from 'ch-sdk-node';
import ApiClient from 'ch-sdk-node/dist/client';
import { Payment } from 'ch-sdk-node/dist/services/payment'
import { ApiResponse } from 'ch-sdk-node/dist/services/resource';
import { failure, success } from 'ch-sdk-node/dist/services/result';
import { StatusCodes } from 'http-status-codes';

import { PaymentService } from '../../src/services/PaymentService';

const MockedAPIClient = ApiClient as jest.Mock<ApiClient>;
const apiClientMock = new MockedAPIClient() as jest.Mocked<ApiClient>;

describe('PaymentService', () => {

  it('should initiate GOV Pay payment and return a GOV Pay URL', async () => {
    const mockUrl = 'http://test.payments.gov.uk/123456';
    const mockResponse = success({
      resource: {
        links: {
          journey: mockUrl
        }
      } as Payment
    } as ApiResponse<Payment>);
    const payMock = jest.fn();
    payMock.mockReturnValue(Promise.resolve(mockResponse));
    apiClientMock.payment.createPayment = payMock;

    jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMock);

    const paymentService = new PaymentService();
    const result = await paymentService.initPayment('testID', '01234567', 'testToken');
    expect(payMock).toHaveBeenCalled();
    expect(result).toEqual(mockUrl);
  });

  it('should throw an error when the CH Payment Wrapper fails', async () => {
    const mockResponse = failure({
      httpStatusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: 'Test Error'
    });
    const payMock = jest.fn();
    payMock.mockReturnValue(Promise.resolve(mockResponse));
    apiClientMock.payment.createPayment = payMock;

    jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMock);

    const paymentService = new PaymentService();
    await expect(paymentService.initPayment('testID', '01234567', 'testToken'))
      .rejects
      .toThrow('Failed to create payment: 500 - Test Error');
  });
});
