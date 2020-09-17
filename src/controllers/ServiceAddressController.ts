import { NextFunction, Request, Response } from 'express';
import { StatusCodes  } from 'http-status-codes';

import { Address } from '../models/SuppressionDataModel'
import { SERVICE_ADDRESS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/session/SessionService'

const template = 'service-address';

export class ServiceAddressController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const session = SessionService.getSuppressionSession(req);
    res.render(template, {
      ...session?.serviceAddress
    });
  }

  public processForm = async (req: Request, res: Response, next: NextFunction) => {
    const session = SessionService.getSuppressionSession(req);
    if (!session) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error');
    }

    session.serviceAddress = req.body as Address;
    SessionService.setSuppressionSession(req, session);
    res.redirect(SERVICE_ADDRESS_PAGE_URI);
  };
}
