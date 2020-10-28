import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'

import { PaymentDetails, SuppressionSession } from '../models/SuppressionSessionModel';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { CHECK_SUBMISSION_PAGE_URI, PAYMENT_CALLBACK_URI } from '../routes/paths';
import { PaymentResource, PaymentService } from '../services/payment/PaymentService';
import SessionService from '../services/session/SessionService';
import { SuppressionService } from '../services/suppression/SuppressionService';

const template: string = 'payment-review';
const backNavigation: string = CHECK_SUBMISSION_PAGE_URI;

export class PaymentReviewController {

  private suppressionService: SuppressionService;
  private paymentService: PaymentService;

  constructor(suppressionService: SuppressionService, paymentService: PaymentService) {
    this.suppressionService = suppressionService;
    this.paymentService = paymentService;
  }

  public renderView = (req: Request, res: Response, next: NextFunction) => {

    try {
      const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

      if (!session || !session.applicationReference) {
        return next(new Error(`${PaymentReviewController.name} - session expected but none found`));
      }

      const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);
      const totalFee = documentAmendmentFee;

      res.render(template, {
        documentAmendmentFee,
        totalFee,
        backNavigation
      });
    } catch (err) {
      return next(new Error(`${PaymentReviewController.name} - ${err}`));
    }
  };

  public continue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

      if (!session || !session.applicationReference) {
        return next(new Error(`${PaymentReviewController.name} - session expected but none found`));
      }

      const accessToken: string =  SessionService.getAccessToken(req);
      const paymentStateUUID: string = uuidv4();

      const paymentUrls: PaymentResource = await this.paymentService.generatePaymentUrl(session.applicationReference, paymentStateUUID, accessToken);

      session.paymentDetails = {
        stateUUID: paymentStateUUID,
        resourceUri: paymentUrls.resourceUri
      } as PaymentDetails;

      SessionService.setSuppressionSession(req, session);
      SessionService.appendNavigationPermissions(req, PAYMENT_CALLBACK_URI);

      res.redirect(paymentUrls.redirectUrl);

    } catch (error) {
      return next(new Error(`${PaymentReviewController.name} - session expected but none found`));
    }
  };
}
