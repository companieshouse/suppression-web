import { NextFunction, Request, Response } from 'express';

import { PaymentStatus } from '../models/PaymentStatus';
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { CONFIRMATION_PAGE_URI, PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';
import { PaymentService } from '../services/payment/PaymentService';
import SessionService from '../services/session/SessionService';
import { SuppressionService } from '../services/suppression/SuppressionService';

export class PaymentCallbackController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService, private readonly paymentService: PaymentService) {
    this.paymentService = paymentService;
    this.suppressionService = suppressionService
  }

  public checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {

    const state: string = req.query.state as string;
    const status: PaymentStatus = req.query.status as PaymentStatus;
    const reference: string = req.query.ref as string;
    if (!(state && status && reference)) {
      return next(new Error(`${PaymentCallbackController.name} - received invalid arguments`));
    }

    const statusIsValid: boolean = Object.values(PaymentStatus).includes(status as PaymentStatus);
    if (!statusIsValid) {
      return next(new Error(`${PaymentCallbackController.name} - received invalid payment status`));
    }

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session || !session.applicationReference) {
      return next(new Error(`${PaymentCallbackController.name} - session expected but none found`));
    }

    const expectedPaymentStateUUID: string | undefined = session.paymentDetails?.stateUUID;
    if (state !== expectedPaymentStateUUID) {
      return next(new Error(`${PaymentCallbackController.name} - payment state mismatch`));
    }

    let redirectURI: string;
    if (status === PaymentStatus.PAID) {
      const paymentResourceUri: string = session.paymentDetails!.resourceUri;
      const accessToken: string =  SessionService.getAccessToken(req);
      const verifiedStatus: PaymentStatus = await this.paymentService.getPaymentStatus(paymentResourceUri, accessToken);
      if (verifiedStatus === PaymentStatus.PAID) {
        redirectURI = CONFIRMATION_PAGE_URI;
      } else {
        console.log(`${PaymentCallbackController.name} - WARN: Could not verify user-reported payment status. Mitigating.`);
        redirectURI = PAYMENT_REVIEW_PAGE_URI;
      }
    } else {
      redirectURI = PAYMENT_REVIEW_PAGE_URI;
    }

    return res.redirect(redirectURI);
  }
}
