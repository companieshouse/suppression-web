import { NextFunction, Request, Response } from 'express';
import { ROOT_URI } from '../routes/paths';

export class StartPageController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    res.render('start-page');
  };

  public start = (req: Request, res: Response) => {
    res.redirect(ROOT_URI);
  };
}
