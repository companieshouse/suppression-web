import { NextFunction, Request, Response } from 'express';

import { Address, SuppressionData } from '../models/SuppressionDataModel';
import { SuppressionSession } from '../models/SuppressionSessionModel';
import { CONTACT_DETAILS_PAGE_URI, PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { SuppressionService } from '../services/suppression/SuppressionService';

const template: string = 'check-submission';
const backNavigation: string = CONTACT_DETAILS_PAGE_URI;
const continueNavigation: string = PAYMENT_REVIEW_PAGE_URI;

export class CheckSubmissionController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService) {
    this.suppressionService = suppressionService
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    try {
      const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

      if (!session || !session.applicationReference) {
        return next(new Error(`${CheckSubmissionController.name} - session expected but none found`));
      }

      const accessToken: string = SessionService.getAccessToken(req);
      const refreshToken: string = SessionService.getRefreshToken(req);

      const suppressionData: SuppressionData = await this.suppressionService.get(session.applicationReference, accessToken, refreshToken);

      const templateData = {
        applicantDetails: suppressionData.applicantDetails,
        addressToRemove: this.addressToList(suppressionData.addressToRemove),
        documentDetails: suppressionData.documentDetails,
        serviceAddress: this.addressToList(suppressionData.serviceAddress),
        contactAddress: this.addressToList(suppressionData.contactAddress)
      };

      res.render(template, {
        ...templateData,
        backNavigation
      });

    } catch (err) {
      return next(new Error(`${CheckSubmissionController.name} - ${err}`));
    }
  }

  public confirm = async (req: Request, res: Response, next: NextFunction) => {
    SessionService.appendNavigationPermissions(req, continueNavigation);
    return res.redirect(continueNavigation);
  };

  private addressToList(address: Address | undefined): string[] {
    if (!address) {
      return [];
    }
    const addressList = Object.values(address);
    return addressList.filter((line) => {
      return line !== '';
    });
  }
}
