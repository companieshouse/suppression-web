import { NextFunction, Request, Response } from 'express';
import { SuppressionData } from '../models/SuppressionDataModel';

import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';
import { RefreshTokenService } from '../services/refresh-token-service/RefreshTokenService';
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

    if (!req.session) {
      throw new Error('Session is undefined')
    }

    const refreshTokenService = new RefreshTokenService(
      getConfigValue(`OAUTH2_TOKEN_URI`) as string,
      getConfigValue(`OAUTH2_CLIENT_ID`) as string,
      getConfigValue(`OAUTH2_CLIENT_SECRET`) as string
    );

    const suppressionService: SuppressionService = new SuppressionService(
      getConfigValue('SUPPRESSION_API_URL') as string,
      refreshTokenService
    );

    const suppression: SuppressionData = SessionService.getSuppressionSession(req)!;
    suppression.applicationReference = await suppressionService.saveSuppression(suppression);
    SessionService.setSuppressionSession(req, suppression);

    res.redirect(PAYMENT_REVIEW_PAGE_URI);
  };
}
