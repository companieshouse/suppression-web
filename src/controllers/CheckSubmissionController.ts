import { NextFunction, Request, Response } from 'express';

import { Address, SuppressionData } from '../models/SuppressionDataModel';
import { CHECK_SUBMISSION_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'

const template = 'check-submission';

export class CheckSubmissionController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const suppressionData: SuppressionData | undefined = SessionService.getSuppressionSession(req);

    console.log(JSON.stringify(suppressionData))
    if (!suppressionData) {
      return next(new Error(`${CheckSubmissionController.name} - session expected but none found`));
    }

    const templateData = {
      applicantDetails: suppressionData.applicantDetails,
      addressToRemove: this.addressToList(suppressionData.addressToRemove),
      documentDetails: suppressionData.documentDetails,
      serviceAddress: this.addressToList(suppressionData.serviceAddress)
    };

    res.render(template, {
      ...templateData
    });
  }

  public confirm = async (req: Request, res: Response, next: NextFunction) => {
    return res.redirect(CHECK_SUBMISSION_PAGE_URI);
  };

  private addressToList(address: Address | undefined): string[] {
    if (!address) {
      return [];
    }
    const addressList = Object.values(address);
    return addressList.filter((e) => {
      return e !== '';
    });
  }
}
