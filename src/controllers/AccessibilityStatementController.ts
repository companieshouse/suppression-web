import { NextFunction, Request, Response } from 'express';

export class AccessibilityStatementController {

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    res.render('accessibility-statement');
  };
}
