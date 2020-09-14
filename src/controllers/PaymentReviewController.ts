import { NextFunction, Request, Response } from 'express';
import { SuppressionData } from '../models/SuppressionDataModel';

import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';
import SessionService from '../services/Session/SessionService';
import { SuppressionService } from '../services/Suppression/SuppressionService';

const template = 'payment-review';

export class PaymentReviewController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10)
    const totalFee = documentAmendmentFee;
    res.render(template, { documentAmendmentFee, totalFee });
  };

  public continue = async (req: Request, res: Response, next: NextFunction) => {

    const suppressionService: SuppressionService = new SuppressionService(getConfigValue('SUPPRESSIONS_API_URL') as string);

    const suppression: SuppressionData = SessionService.getSuppressionSession(req)!;
    suppression.applicationReference = await suppressionService.save(suppression, getConfigValue('CHS_API_KEY') as string);
    SessionService.setSuppressionSession(req, suppression);

    res.redirect(PAYMENT_REVIEW_PAGE_URI);
  };
}
