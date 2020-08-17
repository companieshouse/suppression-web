import { NextFunction, Request, Response } from 'express';

export class StartPageController {

  public renderView = (req: Request, res: Response, next: NextFunction) => res.render('start-page');
}
