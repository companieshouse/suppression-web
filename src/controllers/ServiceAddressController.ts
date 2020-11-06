import { NextFunction, Request, Response } from 'express';

import { SuppressionData } from '../models/SuppressionDataModel'
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { CONTACT_DETAILS_PAGE_URI, DOCUMENT_DETAILS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { SuppressionService } from '../services/suppression/SuppressionService';

const template: string = 'service-address';
const backNavigation: string = DOCUMENT_DETAILS_PAGE_URI;
const continueNavigation: string = CONTACT_DETAILS_PAGE_URI;

export class ServiceAddressController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService) {
    this.suppressionService = suppressionService
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    try {
      const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

      if (!session || !session.applicationReference) {
        return next(new Error(`${ServiceAddressController.name} - session expected but none found`));
      }

      const accessToken: string = SessionService.getAccessToken(req);
      const refreshToken: string = SessionService.getRefreshToken(req);

      const suppressionData: SuppressionData = await this.suppressionService.get(session.applicationReference, accessToken, refreshToken);

      res.render(template, {
        ...suppressionData.serviceAddress,
        backNavigation
      });

    } catch (err) {
      return next(new Error(`${ServiceAddressController.name} - ${err}`));
    }
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    try {
      const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

      if (!session || !session.applicationReference) {
        return next(new Error(`${ServiceAddressController.name} - session expected but none found`));
      }

      const partialSuppressionData: SuppressionData = { serviceAddress: req.body } as SuppressionData;

      const accessToken: string = SessionService.getAccessToken(req);
      const refreshToken: string = SessionService.getRefreshToken(req);

      await this.suppressionService.patch(partialSuppressionData, session.applicationReference, accessToken, refreshToken);

      SessionService.appendNavigationPermissions(req, continueNavigation);

      res.redirect(continueNavigation);

    } catch (err) {
      return next(new Error(`${ServiceAddressController.name} - ${err}`));
    }

  };
}
