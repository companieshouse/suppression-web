import { SessionKey } from 'ch-node-session-handler/lib/session/keys/SessionKey';
import { ISignInInfo } from 'ch-node-session-handler/lib/session/model/SessionInterfaces';
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

    if (!req.session) {
      throw new Error('Session is undefined')
    }

    const suppressionService: SuppressionService = new SuppressionService(getConfigValue('SUPPRESSION_API_URL') as string);

    const signInInfo: ISignInInfo | undefined = req.session!.get(SessionKey.SignInInfo);
    const accessToken: string | undefined = signInInfo?.access_token?.access_token;

    const suppression: SuppressionData = SessionService.getSuppressionSession(req)!;
    suppression.applicationReference = await suppressionService.save(suppression, accessToken!);
    SessionService.setSuppressionSession(req, suppression);

    res.redirect(PAYMENT_REVIEW_PAGE_URI);
  };
}
