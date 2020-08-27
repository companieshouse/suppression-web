import { NextFunction, Request, Response } from 'express';

export class StartPageController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.session);
    res.render('start-page');
  }
  public start = (req: Request, res: Response) => {
    console.log('POST REQUEST');
    req.session!.data = {test: "testing the session"};
    res.render('start-page');
  };
}
