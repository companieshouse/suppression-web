import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
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
    const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);
    const totalFee = documentAmendmentFee;
    res.render(template, {documentAmendmentFee, totalFee});
  };

  public continue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (suppressionData === undefined) {
      throw new Error('Expected session but found none.')
    }

    let applicationReference: string;

    try {
      applicationReference = suppressionData.applicationReference = await this.suppressionService.save(suppressionData, getConfigValue('CHS_API_KEY') as string);
    } catch (err) {
      next(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error');
    }

    try {

      const token: string = SessionService.getAccessToken(req);
      const paymentStateUUID: string = uuidv4();

      const govPayUrl: string = await this.paymentService.initPayment(applicationReference, paymentStateUUID, token);

      const updatedSession: SuppressionData = {
        ...suppressionData,
        paymentStateUUID
      };

      SessionService.setSuppressionSession(req, updatedSession);

      res.redirect(govPayUrl);

    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error');
    }
  };
}
