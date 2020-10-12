import { NextFunction, Request, Response } from 'express';
import { APPLICANT_DETAILS_PAGE_URI} from '../routes/paths';

export class StartPageController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    res.render('start');
  };
S
  public start = (req: Request, res: Response) => {
    res.redirect(APPLICANT_DETAILS_PAGE_URI);
  };
}
