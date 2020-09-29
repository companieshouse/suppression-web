import { NextFunction, Request, Response } from 'express';
import { StatusCodes  } from 'http-status-codes';

import { Address } from '../models/SuppressionDataModel'
import { DOCUMENT_DETAILS_PAGE_URI, SERVICE_ADDRESS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'

const template = 'service-address';
const backNavigation = DOCUMENT_DETAILS_PAGE_URI;

export class ServiceAddressController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const suppressionData = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error('Session expected, but not found'));
    }

    res.render(template, {
      ...suppressionData?.serviceAddress,
      backNavigation
    });
  };

  public processForm = async (req: Request, res: Response, next: NextFunction) => {
    const suppressionData = SessionService.getSuppressionSession(req);

    if (!suppressionData) {
      return next(new Error('Session expected, but not found'));
    }

    suppressionData.serviceAddress = req.body as Address;
    SessionService.setSuppressionSession(req, suppressionData);
    res.redirect(SERVICE_ADDRESS_PAGE_URI);
  };
}
