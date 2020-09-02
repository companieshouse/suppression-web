import { NextFunction, Request, Response } from 'express';

import { SuppressionData } from '../models/SuppressionDataModel';
import { DOCUMENT_DETAILS_PAGE_URI } from '../routes/paths';
import SessionService from '../services/SessionService';
import { DocumentDetailsValidator } from '../validators/DocumentDetailsValidator';

const template = 'document-details';

export class DocumentDetailsController {

  constructor(private dateValidator: DocumentDetailsValidator = new DocumentDetailsValidator()) {}

  public renderView = (req: Request, res: Response, next: NextFunction) => {
    const suppression = SessionService.getSuppressionSession(req);
    res.render(template, suppression);
  }

  public processForm = async (req: Request, res: Response, next: NextFunction) => {

    const validationResult = await this.dateValidator.validate(req);

    if (validationResult.errors.length > 0) {
      res.status(422);
      return res.render(template, {
        ...req.body,
        validationResult
      });
    }

    const suppression: SuppressionData = SessionService.getSuppressionSession(req)!

    const updatedSession: SuppressionData = {
      ...suppression,
      documentDetails: req.body
    }

    SessionService.setSuppressionSession(req, updatedSession)
    res.redirect(DOCUMENT_DETAILS_PAGE_URI);
  }
}
