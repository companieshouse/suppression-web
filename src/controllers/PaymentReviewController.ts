import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'

import { SuppressionData } from '../models/SuppressionDataModel';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { CHECK_SUBMISSION_PAGE_URI } from '../routes/paths';
import { PaymentService } from '../services/payment/PaymentService';
import SessionService from '../services/session/SessionService';
import { SuppressionService } from '../services/suppression/SuppressionService';

const template = 'payment-review';
const backNavigation = CHECK_SUBMISSION_PAGE_URI;

export class PaymentReviewController {

  private suppressionService: SuppressionService;
  private paymentService: PaymentService;

  constructor(suppressionService: SuppressionService, paymentService: PaymentService) {
    this.suppressionService = suppressionService;
    this.paymentService = paymentService;
  }

  public renderView = (req: Request, res: Response, next: NextFunction) => {

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error(`${PaymentReviewController.name} - session expected but none found`));
    }

    const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);
    const totalFee = documentAmendmentFee;

    res.render(template, {
      documentAmendmentFee,
      totalFee,
      backNavigation
    });
  };

  public continue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error(`${PaymentReviewController.name} - session expected but none found`));
    }

    let applicationReference: string;

    try {

      const accessToken: string =  SessionService.getAccessToken(req);
      const paymentStateUUID: string = uuidv4();

      applicationReference = suppressionData.applicationReference = await this.suppressionService.save(suppressionData, accessToken);

      const govPayUrl: string = await this.paymentService.generatePaymentUrl(applicationReference, paymentStateUUID, accessToken);

      const updatedSession: SuppressionData = {
        ...suppressionData,
        paymentStateUUID
      };

      SessionService.setSuppressionSession(req, updatedSession);

      res.redirect(govPayUrl);

    } catch (error) {
      return next(error);
    }
  };
}
