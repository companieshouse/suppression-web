import { NextFunction, Request, Response } from 'express';
import { SuppressionSession } from '../models/suppressionSession.model';
import SessionService from '../services/session.service'
import { ROOT_URI } from '../routes/paths';

export class StartPageController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    console.log('GET REQUEST - ', SessionService.getSuppressionSession(req));
    res.render('start-page');
  }

  public start = (req: Request, res: Response) => {

    const extraData: SuppressionSession = {
      applicantDetails: {fullName: 'Jeremy', emailAddress: 'me@help'}
    };

    SessionService.setSuppressionSession(req, extraData);
    console.log('POST REQUEST - ', SessionService.getSuppressionSession(req));
    res.redirect(ROOT_URI);
  };
}
