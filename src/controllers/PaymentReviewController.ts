import { NextFunction, Request, Response } from 'express';

import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';

const template = 'payment-review';

export class PaymentReviewController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10)
    const totalFee = documentAmendmentFee;
    res.render(template, { documentAmendmentFee, totalFee });
  };

  public continue = (req: Request, res: Response, next: NextFunction) => {
    res.redirect(PAYMENT_REVIEW_PAGE_URI);
  };
}
