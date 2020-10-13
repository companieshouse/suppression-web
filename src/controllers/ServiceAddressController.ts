import { NextFunction, Request, Response } from 'express';

import { Address, SuppressionData } from '../models/SuppressionDataModel'
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { CONTACT_DETAILS_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { SuppressionService } from '../services/suppression/SuppressionService';

const template: string = 'service-address';
const backNavigation: string = DOCUMENT_DETAILS_PAGE_URI;

export class ServiceAddressController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService) {
    this.suppressionService = suppressionService
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session || !session.applicationReference) {
      return next(new Error(`${ServiceAddressController.name} - session expected but none found`));
    }

    const accessToken: string = SessionService.getAccessToken(req);

    const templateData: Address = await this.getServiceAddress(session.applicationReference, accessToken)
      .catch((error) => {
        return next(new Error(`${ServiceAddressController.name} - ${error}`));
      });

    res.render(template, {
      ...templateData,
      backNavigation
    });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {
    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session || !session.applicationReference) {
      return next(new Error(`${ServiceAddressController.name} - session expected but none found`));
    }

    const partialSuppressionData: SuppressionData = { serviceAddress: req.body } as SuppressionData;

    const accessToken: string = SessionService.getAccessToken(req);

    await this.suppressionService.patch(partialSuppressionData, session.applicationReference, accessToken).catch(error => {
      return next(new Error(`${ServiceAddressController.name} - ${error}`));
    });

    res.redirect(CONTACT_DETAILS_PAGE_URI);

  };

  private async getServiceAddress(applicationReference: string | undefined, accessToken: string): Promise<any> {

    const suppressionData: SuppressionData = await this.suppressionService.get(applicationReference!, accessToken);

    if (!suppressionData.serviceAddress) {
      return {};
    }

    return {...suppressionData.serviceAddress};
  }
}
