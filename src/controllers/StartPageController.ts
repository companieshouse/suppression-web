import { Request, Response } from 'express';
import { ROOT_URI } from '../routes/paths';

export class StartPageController {

  public renderView = (req: Request, res: Response) => {
    res.render('start-page');
  };

  public route = (req: Request, res: Response) => {
    return res.redirect(ROOT_URI)
  }
}
