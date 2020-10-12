import { NextFunction, Request, Response } from 'express';

import { Address, SuppressionData } from '../models/SuppressionDataModel';
import { SuppressionSession } from '../models/suppressionSessionModel';
import { CONTACT_DETAILS_PAGE_URI, PAYMENT_REVIEW_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'
import { SuppressionService } from '../services/suppression/SuppressionService';
import { FormValidator } from '../validators/FormValidator';
import { schema as formSchema } from '../validators/schema/AddressToRemoveSchema';

const template = 'check-submission';
const backNavigation = CONTACT_DETAILS_PAGE_URI;

export class CheckSubmissionController {

  private suppressionService: SuppressionService;

  constructor(suppressionService: SuppressionService) {
    this.suppressionService = suppressionService
  }

  public renderView = async (req: Request, res: Response, next: NextFunction) => {

    const session: SuppressionSession | undefined = SessionService.getSuppressionSession(req);

    if (!session) {
      return next(new Error(`${CheckSubmissionController.name} - session expected but none found`));
    }

    const accessToken: string = SessionService.getAccessToken(req);

    const suppressionData: SuppressionData = await this.suppressionService.get(session.applicationReference!, accessToken)
      .catch(reason => {
        throw new Error(`${CheckSubmissionController.name} - ${reason} `);
      });

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
  }

  public confirm = async (req: Request, res: Response, next: NextFunction) => {
    return res.redirect(PAYMENT_REVIEW_PAGE_URI);
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
