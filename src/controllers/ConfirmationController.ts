import { NextFunction, Request, Response } from 'express';
import { SuppressionData } from '../models/SuppressionDataModel';
import { SuppressionSession } from '../models/suppressionSessionModel';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import SessionService from '../services/session/SessionService'
import { SuppressionService } from '../services/suppression/SuppressionService';

const template = 'confirmation';

export class ConfirmationController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService){
    this.suppressionService = suppressionService;
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {
    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session) {
      return next(new Error(`${ConfirmationController.name} - session expected but none found`));
    } else if (!session.applicationReference) {
      return next(new Error(`${ConfirmationController.name} - application reference expected in session but none found`));
    }

    const processingDelayEvent = getConfigValue('PROCESSING_DELAY_EVENT');
    const paymentReceived = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);

    const accessToken: string = SessionService.getAccessToken(req);

    const suppressionData: SuppressionData = await this.suppressionService.get(session.applicationReference, accessToken)
      .catch(reason => {
        throw new Error(`${ConfirmationController.name} - ${reason} `);
      });

    res.render(template, {
      applicationReference: session.applicationReference,
      userEmailAddress: SessionService.getUserEmail(req),
      documentDetails: suppressionData.documentDetails,
      processingDelayEvent,
      paymentReceived
    });
  }
}
