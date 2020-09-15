import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid'

import { SuppressionData } from '../models/SuppressionDataModel';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';
import { PaymentService } from '../services/PaymentService';
import SessionService from '../services/Session/SessionService';
import { SuppressionService } from '../services/Suppression/SuppressionService';

const template = 'payment-review';

export class PaymentReviewController {

   private suppressionService: SuppressionService;
   private paymentService: PaymentService;

   constructor(suppressionService: SuppressionService, paymentService: PaymentService){
    this.suppressionService = suppressionService;
    this.paymentService = paymentService;
  }

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);
    const totalFee = documentAmendmentFee;
    res.render(template, { documentAmendmentFee, totalFee });
  };

  public continue = async (req: Request, res: Response, next: NextFunction) => {

    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (suppressionData === undefined) {
      throw new Error('Expected session but found none.')
    }
    try {
      suppressionData.applicationReference = await this.suppressionService.save(suppressionData, getConfigValue('CHS_API_KEY') as string);
    } catch (err){
      next(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error');
    }

    const suppressionID = 'placeholder';
    // } END OUT OF SCOPE

    let paymentStateUUID = suppressionData?.paymentStateUUID;
    if (paymentStateUUID === undefined) {
      paymentStateUUID = uuidv4()

      try {
        const token = SessionService.getAccessToken(req)
        const govpayUrl = await this.paymentService.initPayment(suppressionID, paymentStateUUID, token);
        suppressionData.paymentStateUUID = paymentStateUUID
        SessionService.setSuppressionSession(req, suppressionData)
        res.redirect(govpayUrl);
      } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error');
      }

    } else {
      // OUT OF SCOPE: Check payment status, redirect accordingly
      res.redirect(PAYMENT_REVIEW_PAGE_URI)
    }
  };
}
