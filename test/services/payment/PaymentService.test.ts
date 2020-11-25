import * as nodeSdk from '@companieshouse/api-sdk-node';
import ApiClient from '@companieshouse/api-sdk-node/dist/client';
import { Payment } from '@companieshouse/api-sdk-node/dist/services/payment'
import { ApiResponse } from '@companieshouse/api-sdk-node/dist/services/resource';
import { failure, success } from '@companieshouse/api-sdk-node/dist/services/result';
import { StatusCodes } from 'http-status-codes';
import { PaymentStatus } from '../../../src/models/PaymentStatus';

import { PaymentService } from '../../../src/services/payment/PaymentService';
import { RefreshTokenService } from '../../../src/services/refresh-token/RefreshTokenService';

const MockedAPIClient = ApiClient as jest.Mock<ApiClient>;
const apiClientMockFailure = new MockedAPIClient() as jest.Mocked<ApiClient>;
const apiClientMockSuccess = new MockedAPIClient() as jest.Mocked<ApiClient>;

const mockApplicationReference: string = 'testID';
const mockResourceUri: string = 'payments/testID'
const mockPaymentStateUUID: string = '01234567';
const mockToken: string = 'testToken';
const mockNewToken: string = 'newTestToken';
const mockRefreshToken: string = 'refresh-token';
const mockRefreshClientId: string = '1';
const mockRefreshClientSecret: string = 'ABC';
const mockRefreshServiceUri: string = 'http://localhost/oauth2/token';
const mockUrl = 'http://test.payments.gov.uk/123456';
const mockResource = 'payments/TEST123456'

const refreshTokenService: RefreshTokenService =
  new RefreshTokenService(mockRefreshServiceUri, mockRefreshClientId, mockRefreshClientSecret);

const mockResponseFailure = (statusCode) => failure({
  httpStatusCode: statusCode,
  errors: 'Test Error'
});

describe('PaymentService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePaymentUrl', () => {

    const mockResponseSuccess = success({
      resource: {
        links: {
          journey: mockUrl,
          self: mockResource
        }
      } as Payment
    } as ApiResponse<Payment>);

    it('should initiate GOV Pay payment and return a GOV Pay URL', async () => {
      const payMock = jest.fn();
      payMock.mockReturnValue(Promise.resolve(mockResponseSuccess));
      apiClientMockFailure.payment.createPayment = payMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMockFailure);

      const paymentService = new PaymentService(refreshTokenService);
      const result = await paymentService.generatePaymentUrl(mockApplicationReference, mockPaymentStateUUID, mockToken, mockRefreshToken);
      expect(payMock).toHaveBeenCalled();
      expect(result.redirectUrl).toEqual(mockUrl + '?summary=false');
      expect(result.resourceUri).toEqual(mockResource);
    });

    it('should throw an error when the CH Payment Wrapper fails', async () => {
      const payMock = jest.fn();
      payMock.mockReturnValue(Promise.resolve(mockResponseFailure(StatusCodes.INTERNAL_SERVER_ERROR)));
      apiClientMockFailure.payment.createPayment = payMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMockFailure);

      const paymentService = new PaymentService(refreshTokenService);
      await expect(paymentService.generatePaymentUrl(mockApplicationReference, mockPaymentStateUUID, mockToken, mockRefreshToken))
        .rejects
        .toThrow('Failed to initiate payment - status: 500, error: Test Error');
    });

    it('should refresh token when the CH Payment Wrapper fails with 401 unauthorised', async () => {

      apiClientMockFailure.payment.createPayment = jest.fn().mockReturnValue(Promise.resolve(mockResponseFailure(StatusCodes.UNAUTHORIZED)));
      apiClientMockSuccess.payment.createPayment = jest.fn().mockReturnValue(Promise.resolve(mockResponseSuccess));

      const apiClientSpy = jest.spyOn(nodeSdk, 'createApiClient')
        .mockImplementationOnce(() => apiClientMockFailure)
        .mockImplementationOnce(() => apiClientMockSuccess);

      const refreshTokenSpy = jest.spyOn(RefreshTokenService.prototype, 'refresh').mockReturnValue(Promise.resolve(mockNewToken));

      const paymentService = new PaymentService(refreshTokenService);
      const result = await paymentService.generatePaymentUrl(mockApplicationReference, mockPaymentStateUUID, mockToken, mockRefreshToken);
      expect(apiClientSpy).toHaveBeenCalledTimes(2);
      expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
      expect(result.redirectUrl).toEqual(mockUrl + '?summary=false');
      expect(result.resourceUri).toEqual(mockResource);
    });

    it('should throw an error when the CH Payment Wrapper fails with 401 unauthorised and refresh token fails', async () => {
      apiClientMockFailure.payment.createPayment = jest.fn().mockReturnValue(Promise.resolve(mockResponseFailure(StatusCodes.UNAUTHORIZED)));

      const apiClientSpy = jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMockFailure);

      const refreshTokenSpy = jest.spyOn(RefreshTokenService.prototype, 'refresh').mockRejectedValue(new Error('Error!'));

      const paymentService = new PaymentService(refreshTokenService);
      await expect(paymentService.generatePaymentUrl(mockApplicationReference, mockPaymentStateUUID, mockToken, mockRefreshToken))
        .rejects
        .toThrow('Error!');
      expect(apiClientSpy).toHaveBeenCalled();
      expect(refreshTokenSpy).toHaveBeenCalled();
    });

  });

  describe('getPaymentStatus', () => {

    const mockResponseSuccess = success({
      resource: {
        status: PaymentStatus.PAID
      } as Payment
    } as ApiResponse<Payment>);

    it('should retrieve the payment session’s status', async () => {
      const mockResponse = mockResponseSuccess;
      const payMock = jest.fn();
      payMock.mockReturnValue(Promise.resolve(mockResponse));
      apiClientMockFailure.payment.getPayment = payMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMockFailure);

      const paymentService = new PaymentService(refreshTokenService);
      const result = await paymentService.getPaymentStatus(mockResourceUri, mockToken, mockRefreshToken);
      expect(payMock).toHaveBeenCalled();
      expect(result).toEqual(PaymentStatus.PAID);
    });

    it('should throw an error when the CH Payment Wrapper fails', async () => {
      const payMock = jest.fn();
      payMock.mockReturnValue(Promise.resolve(mockResponseFailure(StatusCodes.INTERNAL_SERVER_ERROR)));
      apiClientMockFailure.payment.getPayment = payMock;

      jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMockFailure);

      const paymentService = new PaymentService(refreshTokenService);
      await expect(paymentService.getPaymentStatus(mockResourceUri, mockToken, mockRefreshToken))
        .rejects
        .toThrow('Failed to verify payment status - status: 500, error: Test Error');
    });

    it('should refresh token when the CH Payment Wrapper fails with 401 unauthorised', async () => {
      apiClientMockFailure.payment.getPayment = jest.fn().mockReturnValue(Promise.resolve(mockResponseFailure(StatusCodes.UNAUTHORIZED)));
      apiClientMockSuccess.payment.getPayment = jest.fn().mockReturnValue(Promise.resolve(mockResponseSuccess));

      const apiClientSpy = jest.spyOn(nodeSdk, 'createApiClient')
        .mockImplementationOnce(() => apiClientMockFailure)
        .mockImplementationOnce(() => apiClientMockSuccess);

      const refreshTokenSpy = jest.spyOn(RefreshTokenService.prototype, 'refresh').mockReturnValue(Promise.resolve(mockNewToken));

      const paymentService = new PaymentService(refreshTokenService);
      const result = await paymentService.getPaymentStatus(mockResourceUri, mockToken, mockRefreshToken);
      expect(apiClientSpy).toHaveBeenCalledTimes(2);
      expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(PaymentStatus.PAID);
    });

    it('should throw an error when the CH Payment Wrapper fails with 401 unauthorised and refresh token fails', async () => {
      apiClientMockFailure.payment.getPayment = jest.fn().mockReturnValue(Promise.resolve(mockResponseFailure(StatusCodes.UNAUTHORIZED)));

      const apiClientSpy = jest.spyOn(nodeSdk, 'createApiClient').mockImplementationOnce(() => apiClientMockFailure);

      const refreshTokenSpy = jest.spyOn(RefreshTokenService.prototype, 'refresh').mockRejectedValue(new Error('Error!'));

      const paymentService = new PaymentService(refreshTokenService);
      await expect(paymentService.getPaymentStatus(mockResourceUri, mockToken, mockRefreshToken))
        .rejects
        .toThrow('Error!');
      expect(apiClientSpy).toHaveBeenCalled();
      expect(refreshTokenSpy).toHaveBeenCalled();
    });
  });
});
