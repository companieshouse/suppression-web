import { NextFunction, Request, Response } from 'express';

import { PaymentStatus } from '../models/PaymentStatus';
import { SuppressionData } from '../models/SuppressionDataModel';
import { CONFIRMATION_PAGE_URI, PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';
import { PaymentService } from '../services/payment/PaymentService';
import SessionService from '../services/session/SessionService';

export class PaymentCallbackController {

  constructor(private readonly paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  public checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {

    const state = req.query.state;
    const status = req.query.status;
    const reference = req.query.ref;
    if (!(state && status && reference)) {
      return next(new Error(`${PaymentCallbackController.name} - received invalid arguments`));
    }

    const statusIsValid: boolean = Object.values(PaymentStatus).includes(status as PaymentStatus)
    if (!statusIsValid) {
      return next(new Error(`${PaymentCallbackController.name} - received invalid payment status`));
    }

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);
    if (!suppressionData) {
      return next(new Error(`${PaymentCallbackController.name} - session expected but none found`));
    }

    const expectedPaymentStateUUID = suppressionData.paymentDetails.stateUUID;
    if (state !== expectedPaymentStateUUID) {
      return next(new Error(`${PaymentCallbackController.name} - payment state mismatch`));
    }

    let redirectURI: string;
    if (status === PaymentStatus.PAID) {
      const paymentResourceUri = suppressionData.paymentDetails.resourceUri;
      const accessToken: string =  SessionService.getAccessToken(req);
      const verifiedStatus = await this.paymentService.getPaymentStatus(paymentResourceUri, accessToken);
      if (verifiedStatus === PaymentStatus.PAID) {
        redirectURI = CONFIRMATION_PAGE_URI;
      } else {
        console.log(`${PaymentCallbackController.name} - WARN: Could not verify user-reported payment status. Mitigating.`);
        redirectURI = PAYMENT_REVIEW_PAGE_URI;
      }
    } else {
      redirectURI = PAYMENT_REVIEW_PAGE_URI;
    }

    suppressionData.paymentDetails.status = status as PaymentStatus;
    SessionService.setSuppressionSession(req, suppressionData);

    return res.redirect(redirectURI);
  }
}
