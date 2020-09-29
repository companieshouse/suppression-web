import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'

import { SuppressionData } from '../models/SuppressionDataModel';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PaymentService } from '../services/payment/PaymentService';
import SessionService from '../services/session/SessionService';
import { SuppressionService } from '../services/suppression/SuppressionService';

const template = 'payment-review';

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
      return next(new Error('Session expected, but not found'));
    }

    const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);
    const totalFee = documentAmendmentFee;
    res.render(template, {documentAmendmentFee, totalFee});
  };

  public continue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error('Session expected, but not found'));
    }

    const accessToken: string =  SessionService.getAccessToken(req);
    let applicationReference: string;

    try {

      applicationReference = suppressionData.applicationReference = await this.suppressionService.save(suppressionData, accessToken);

    } catch(error){
      return next(error)
    }

    try {

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
      error.statusCode = 500;
      return next(error);
    }
  };
}
