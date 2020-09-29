import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Address } from '../models/SuppressionDataModel';
import { CHECK_SUBMISSION_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'

const template = 'check-submission';

export class CheckSubmissionController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const suppressionData = SessionService.getSuppressionSession(req);
    if (!suppressionData?.serviceAddress) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error');
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

  private addressToList(address: Address): string[] {
    const addressList = Object.values(address);
    return addressList.filter((e) => {
      return e !== '';
    });
  }
}
