import { Request, Response } from 'express';

export class StartPageController {

  public renderView = (req: Request, res: Response) => {
    res.render('start-page');
  };

  public route = (req: Request, res: Response) => {
    return res.redirect('/suppress-my-details/test')
  }
}
