import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build';
import { SuppressionData } from '../models/SuppressionDataModel';

import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';
import SessionService from '../services/Session/SessionService';
import { SuppressionService } from '../services/Suppression/SuppressionService';

const template = 'payment-review';

export class PaymentReviewController {

   private suppressionService: SuppressionService;

   constructor(suppressionService: SuppressionService){
    this.suppressionService = suppressionService;
  }

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);
    const totalFee = documentAmendmentFee;
    res.render(template, { documentAmendmentFee, totalFee });
  };

  public continue = async (req: Request, res: Response, next: NextFunction) => {

    const suppression: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppression) {
      throw Error('session data expected but none found')
    }
    try{
      suppression.applicationReference = await this.suppressionService.save(suppression, getConfigValue('CHS_API_KEY') as string);
    } catch (err){
      next(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error');
    }
    SessionService.setSuppressionSession(req, suppression);

    res.redirect(PAYMENT_REVIEW_PAGE_URI);
  };
}
