import { NextFunction, Request, Response } from 'express';
import { DOCUMENT_DETAILS_PAGE_URI } from '../routes/paths';

export class DocumentDetailsController {

  public renderView = (req: Request, res: Response, next: NextFunction) => res.render('document-details');

  public processForm = (req: Request, res: Response, next: NextFunction) => {
    res.redirect(DOCUMENT_DETAILS_PAGE_URI);
  }
}
