import { NextFunction, Request, Response } from 'express';
import { SuppressionData } from '../models/SuppressionDataModel';
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import SessionService from '../services/session/SessionService'
import { SuppressionService } from '../services/suppression/SuppressionService';

const template: string = 'confirmation';

export class ConfirmationController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService){
    this.suppressionService = suppressionService;
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    try {

      const session: SuppressionSession = SessionService.getSuppressionSession(req)!;
      console.log(`Session at Confirmation Controller: ${JSON.stringify(session)}`);
      const applicationReference: string = session.previousApplicationReference!;

      const accessToken: string = SessionService.getAccessToken(req);
      const suppressionData: SuppressionData = await this.suppressionService.get(applicationReference, accessToken);

      const processingDelayEvent = getConfigValue('PROCESSING_DELAY_EVENT');
      const paymentReceived = parseInt(getConfigValue('DOCUMENT_AMENDMENT_FEE') as string, 10);

      res.render(template, {
        applicationReference,
        userEmailAddress: SessionService.getUserEmail(req),
        documentDetails: suppressionData.documentDetails,
        processingDelayEvent,
        paymentReceived
      });

    } catch(err) {
      return next(new Error(`${ConfirmationController.name} - ${err}`));
    }
  }
}
