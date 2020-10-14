import * as nodeSdk from '@companieshouse/api-sdk-node';
import ApiClient from '@companieshouse/api-sdk-node/dist/client';
import { Payment } from '@companieshouse/api-sdk-node/dist/services/payment'
import { ApiResponse } from '@companieshouse/api-sdk-node/dist/services/resource';
import { failure, success } from '@companieshouse/api-sdk-node/dist/services/result';
import { StatusCodes } from 'http-status-codes';
import { PaymentStatus } from '../../../src/models/PaymentStatus';

import { PaymentService } from '../../../src/services/payment/PaymentService';

const MockedAPIClient = ApiClient as jest.Mock<ApiClient>;
const apiClientMock = new MockedAPIClient() as jest.Mocked<ApiClient>;

const mockApplicationReference: string = 'testID';
const mockResourceUri: string = 'payments/testID'
const mockPaymentStateUUID: string = '01234567';
const mockToken: string = 'testToken';

describe('PaymentService', () => {

  describe('generatePaymentUrl', () => {

    it('should initiate GOV Pay payment and return a GOV Pay URL', async () => {
      const mockUrl = 'http://test.payments.gov.uk/123456';
      const mockResource = 'payments/TEST123456'
      const mockResponse = success({
        resource: {
          links: {
            journey: mockUrl,
            self: mockResource
          }
        } as Payment
      } as ApiResponse<Payment>);
      const payMock = jest.fn();
      payMock.mockReturnValue(Promise.resolve(mockResponse));
      apiClientMock.payment.createPayment = payMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMock);

      const paymentService = new PaymentService();
      const result = await paymentService.generatePaymentUrl(mockApplicationReference, mockPaymentStateUUID, mockToken);
      expect(payMock).toHaveBeenCalled();
      expect(result.redirectUrl).toEqual(mockUrl + '?summary=false');
      expect(result.resourceUri).toEqual(mockResource);
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
      await expect(paymentService.generatePaymentUrl(mockApplicationReference, mockPaymentStateUUID, mockToken))
        .rejects
        .toThrow('Failed to initiate payment - status: 500, error: Test Error');
    });

  });

  describe('getPaymentStatus', () => {

    it('should retrieve the payment session’s status', async () => {
      const mockResponse = success({
        resource: {
          status: PaymentStatus.PAID
        } as Payment
      } as ApiResponse<Payment>);
      const payMock = jest.fn();
      payMock.mockReturnValue(Promise.resolve(mockResponse));
      apiClientMock.payment.getPayment = payMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMock);

      const paymentService = new PaymentService();
      const result = await paymentService.getPaymentStatus(mockResourceUri, mockToken);
      expect(payMock).toHaveBeenCalled();
      expect(result).toEqual(PaymentStatus.PAID);
    });

    it('should throw an error when the CH Payment Wrapper fails', async () => {
      const mockResponse = failure({
        httpStatusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        errors: 'Test Error'
      });
      const payMock = jest.fn();
      payMock.mockReturnValue(Promise.resolve(mockResponse));
      apiClientMock.payment.getPayment = payMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMock);

      const paymentService = new PaymentService();
      await expect(paymentService.getPaymentStatus(mockResourceUri, mockToken))
        .rejects
        .toThrow('Failed to verify payment status - status: 500, error: Test Error');
    });

  });

});
