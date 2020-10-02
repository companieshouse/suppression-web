import { NextFunction, Request, Response } from 'express';

import { SuppressionData } from '../models/SuppressionDataModel';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import SessionService from '../services/session/SessionService'

const template = 'confirmation';

export class ConfirmationController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error(`${ConfirmationController.name} - session expected but none found`));
    } else if (!suppressionData.applicationReference) {
      return next(new Error(`${ConfirmationController.name} - application reference expected in session but none found`));
    }

    const processingDelayEvent = getConfigValue('PROCESSING_DELAY_EVENT');
    const documentAmendmentFee = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);
    const paymentReceived = documentAmendmentFee;

    res.render(template, {
      applicationReference: suppressionData.applicationReference,
      userEmailAddress: SessionService.getUserEmail(req),
      documentDetails: suppressionData.documentDetails,
      processingDelayEvent,
      paymentReceived
    });
  }
}
