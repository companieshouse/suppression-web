import { NextFunction, Request, Response } from 'express';
import { ROOT_URI } from '../routes/paths';
import SessionService from '../services/SessionService';

export class StartPageController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    res.render('start-page');
  };

  public start = (req: Request, res: Response) => {
    SessionService.setSuppressionSession(req, {applicantDetails: {fullName: 'Mr. Toot', emailAddress: 'toot@gmail.com'}});
    res.redirect(ROOT_URI);
  };
}
